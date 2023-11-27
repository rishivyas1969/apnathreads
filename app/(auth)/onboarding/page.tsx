import AccountProfile from "@/app/components/forms/AccountProfile"
import { currentUser } from "@clerk/nextjs"

async function Page () {
    const user = await currentUser()
    const userInfo: any = {}

    const userData = {
        id: user?.id,
        objectId: userInfo?._id,
        username: userInfo?.usersname || user?.username,
        name: userInfo?.name || user?.firstName || "",
        bio: userInfo?.bio || "",
        image: userInfo?.image || user?.imageUrl,

    }
    return (
        <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
            <h1 className="head-text">OnBoarding</h1>
            <p className="mt-3 text-base-regular text-light-2">Complete your profile now to use Apna Threads</p>

            <section className="mt-9 bg-dark p-10 border-solid border-2 border-sky-500 rounded-lg">
                <AccountProfile
                    user={userData}
                    btnTitle="Continue"
                />
            </section>
        </main>
    ) 
}

export default Page