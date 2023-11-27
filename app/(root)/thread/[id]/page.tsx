import Comment from "@/app/components/forms/Comment"
import ThreadCard from "@/app/components/cards/ThreadCard"
import { currentUser } from "@clerk/nextjs"
import { fetchThreadById } from "@/lib/actions/thread.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import { redirect } from "next/navigation"

const Page = async ({ params }: { params: { id: string } }) => {
    if (!params.id) return null

    const user = await currentUser()
    if (!user) return null

    const userInfo = await fetchUser(user.id)
    if (!userInfo?.onboarded) redirect('/onboarding')

    const data = await fetchThreadById(params.id)
    if (!data || !data.thread) redirect('/')
    const thread = data.thread

    return (
        <section className="relative">
            <div>
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={user?.id || ""}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            </div>

            <div className="mt-7">
                <Comment
                    threadId={thread.id}
                    currentUserId={JSON.stringify(userInfo._id)}
                    currentUserImg={userInfo.image}
                    />
            </div>

            <div className="mt-10">
                {thread.children.map((children: any) => (
                    <ThreadCard
                        key={children._id}
                        id={children._id}
                        currentUserId={children.author?.id}
                        parentId={children.parentId}
                        content={children.text}
                        author={children.author}
                        community={children.community}
                        createdAt={children.createdAt}
                        comments={children.children}
                        isComment
                    />
                ))}
            </div>
        </section>
    )
}

export default Page