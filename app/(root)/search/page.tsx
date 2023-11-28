import { fetchUser, fetchUsers } from "@/lib/actions/user.actions"

import Image from "next/image"
import ProfileHeader from "@/app/components/shared/ProfileHeader"
import ThreadsTab from "@/app/components/shared/ThreadsTab"
import UserCard from "@/app/components/cards/UserCard"
import { currentUser } from "@clerk/nextjs"
import { profileTabs } from "@/constants"
import { redirect } from "next/navigation"

async function Page ({ params }: { params: {id: string} }) {
    const user = await currentUser()
    if (!user) return null

    const userInfo = await fetchUser(user.id)

    if (!userInfo) redirect('/onboarding')

    const result = await fetchUsers({
        userId: user.id,
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
            { result.users.length === 0 ? (
                <p className="no-result">No Users</p>
            ) : (
                <>
                {result.users.map((person) => (
                    <UserCard 
                        key={person.id}
                        id={person.id}
                        name={person.name}
                        username={person.username}
                        imgUrl={person.image}
                        personType='User'
                    />
                ))}
                </>
            )}
        </div>
    </section>
  )
}

export default Page