"use server"

import { FilterQuery, SortOrder } from "mongoose"

import Thread from "../models/thread.models"
import User from "../models/user.models"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"

interface UserUpdateData {
    username: string,
    name: string,
    bio: string,
    image: string,
    onboarded: boolean
}

export async function updateUser (userId: string, userData: UserUpdateData, path: string): Promise<void> {
    connectToDB()

    try {
        await User.findOneAndUpdate(
            { id: userId },
            { 
                username: userData.username.toLowerCase(),
                name: userData.name,
                bio: userData.bio,
                image: userData.image,
                onboarded: userData.onboarded,
            },
            { upsert: true }
            )
    
        if (path === '/profile/edit') {
            revalidatePath(path)
        }
    } catch (error) {
        throw new Error(`Failed create/update a User: ${error}`)
    }
}

export async function fetchUser (userId: string) {
    try {
        connectToDB()

        return await User.findOne({ id: userId })
        // .populate({
        //     path: 'communities',
        //     model: Community,
        // })
    } catch (err: any) {
        throw new Error(`Failed to fetch User: ${err.message}`)
    }
}

export async function fetchUsers ({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = 'desc',
}: {
    userId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: SortOrder
}) {
    try {
        connectToDB()

        const skipAmount = (pageNumber - 1) * pageSize

        const regex = new RegExp(searchString, 'i')

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        if (searchString.trim() !== '') {
            query.$or = [
                {username: { $regex: regex }},
                {name: { $regex: regex }}
            ]
        }

        const sortOptions: { [key: string]: SortOrder } = { createdAt: sortBy }

        const userQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize)

        const totalUserCount = await User.countDocuments(userQuery)
        const users = await userQuery.exec()

        const isNext = totalUserCount > skipAmount + users.length

        return { users, isNext }
    } catch (err: any) {
        throw new Error(`Unable to fetch users for (${searchString}): ${err.mesage}`)
    }
}

export async function getActivity (userId: string) {
    try {
        connectToDB()

        const userThreads = await Thread.find({ author: userId })

        const childThreadsIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, [])

        const replies = await Thread.find({
            _id: { $in: childThreadsIds },
            author: { $ne: userId }
        })
        .populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies
    } catch (err: any) {
        throw new Error(`Failed to fetch activty (userId: ${userId}): ${err.message}`)
    }
}