import { fetchUser, fetchUsers } from "@/lib/actions/user.actions"

import CommunityCard from "@/app/components/cards/CommunityCard"
import Image from "next/image"
import ProfileHeader from "@/app/components/shared/ProfileHeader"
import ThreadsTab from "@/app/components/shared/ThreadsTab"
import UserCard from "@/app/components/cards/UserCard"
import { currentUser } from "@clerk/nextjs"
import { fetchCommunities } from "@/lib/actions/community.actions"
import { profileTabs } from "@/constants"
import { redirect } from "next/navigation"

async function Page ({ params }: { params: {id: string} }) {
    const user = await currentUser()
    if (!user) return null

    const userInfo = await fetchUser(user.id)

    if (!userInfo) redirect('/onboarding')

    const result = await fetchCommunities({
        searchString: '',
        pageSize: 25,
        pageNumber: 1,
    })
  return (
    <section>
        <h1 className='head-text mb-10'>
            Search
        </h1>

        {/* Search bar */}

        <div className="mt-14 flex flex-col gap-9">
            { result.communities.length === 0 ? (
                <p className="no-result">No communities</p>
            ) : (
                <>
                {result.communities.map((community) => (
                    <CommunityCard
                        key={community.id}
                        id={community.id}
                        name={community.name}
                        username={community.username}
                        imgUrl={community.image}
                        bio={community.bio}
                        members={community.members}
                    />
                ))}
                </>
            )}
        </div>
    </section>
  )
}

export default Page