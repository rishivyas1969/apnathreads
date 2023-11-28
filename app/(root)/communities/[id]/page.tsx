import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { communityTabs, profileTabs } from "@/constants"
import { fetchCommunities, fetchCommunityDetails } from "@/lib/actions/community.actions"

import Image from "next/image"
import ProfileHeader from "@/app/components/shared/ProfileHeader"
import ThreadsTab from "@/app/components/shared/ThreadsTab"
import User from "@/lib/models/user.models"
import UserCard from "@/app/components/cards/UserCard"
import { currentUser } from "@clerk/nextjs"
import { fetchUser } from "@/lib/actions/user.actions"
import { redirect } from "next/navigation"

async function Page ({ params }: { params: {id: string} }) {
    const user = await currentUser()
    if (!user) return null

    const community = await fetchCommunityDetails(params.id)

    return (
        <section>
            <ProfileHeader
                accountId={community.id}
                authUserId={user.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                type="Community"
            />

            <div className="mt-9">
                <Tabs className="w-full" defaultValue="threads">
                    <TabsList className="tab">
                        {communityTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className="object-contain"/>

                                    <p className="max-sm:hidden">{tab.label}</p>

                                    {tab.label === 'Threads' && (
                                        <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">{community?.threads?.length}</p>
                                    )}
                            </TabsTrigger>

                        ))}
                    </TabsList>

                        <TabsContent value="threads" className="w-full text-light-1">
                            <ThreadsTab
                                currentUserId={user.id}
                                accountId={community._id}
                                accountType="Community"
                            />
                        </TabsContent>

                        <TabsContent value="members" className="w-full text-light-1">
                            <section className="mt-9 flex flex-col gap-10">
                              {community?.members.map((member: any) => (
                                <UserCard
                                  key={member.id}
                                  id={member.id}
                                  name={member.name}
                                  username={member.username}
                                  imgUrl={member.image}
                                  personType="User"
                                />
                              ))}
                            </section>
                        </TabsContent>

                        <TabsContent value="requests" className="w-full text-light-1">
                            <ThreadsTab
                                currentUserId={user.id}
                                accountId={community._id}
                                accountType="Community"
                            />
                        </TabsContent>
                </Tabs>
            </div>
        </section>
    )
}

export default Page