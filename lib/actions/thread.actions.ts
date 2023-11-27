"use server"

import Thread from "../models/thread.models"
import User from "../models/user.models"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

export async function createThread ({ text, author, communityId, path}: Params) {
    try {
        connectToDB()

        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        })

        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        })

        revalidatePath(path)
    } catch (err: any) {
        throw new Error(`Failed to upload a thread: ${err.message}`)
    }
}

export async function fetchThreads (pagenumber = 1, size = 20) {
    try {
        connectToDB()

        const skipAmount = (pagenumber - 1) * size

        const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] }})
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .limit(size)
            .populate({ path: 'author', model: User })
            .populate({
                path: 'children',
                populate: {
                    path: 'author',
                    model: User,
                    select: "_id name parentId image",
                },
             })

        const totalThreadCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] }})
        const threads = await threadsQuery.exec()

        const isNext = totalThreadCount > (skipAmount + threads.length)

        return { threads, isNext }

    } catch (err: any) {
        throw new Error(`Failed to Fetch Threads: ${err.message}`)
    }
}

export async function fetchThreadById (threadId: string) {
    try {
        connectToDB()

        // TODO: COmmunity
        const threadQuery = Thread.findOne({ id: { $equal: threadId }})
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image",
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    }
                }
            ]
        })
        const thread = await threadQuery.exec()

        return { thread }

    } catch (err: any) {
        throw new Error(`Failed to Fetch Thread by ID(${threadId}): ${err.message}`)
    }
}

export async function addCommentToThread (
    threadId: string,
    commentText: string,
    userId: string,
    path: string
) {
    try {
        connectToDB()

        const originalThread = await Thread.findById(threadId)
        if (!originalThread) throw new Error('Thread not found!')

        console.log('\n\n User: ', userId)

        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId,
        })
        const savedComment = await commentThread.save()

        originalThread.children.push(savedComment._id)
        await originalThread.save()

        revalidatePath(path)
    } catch (err: any) {
        throw new Error(`Failed to upload a comment on thread(${threadId}): ${err.message}`)
    }
}

export async function fetchUserPosts (userId: string) {
    try {
        connectToDB()

        const threads = await User.findOne({ id: userId})
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            })
        
        return threads
    } catch (err: any) {
        throw new Error(`Failed to Fetch Posts of UserId(${userId}): ${err.message}`)
    }
}