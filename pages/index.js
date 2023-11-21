import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";

export default function Home() {
  const {data: session} = useSession();
  return <Layout>
    <div className="text-blue-900 flex justify-between">
      <h1>
      Hello, <b>{session?.user?.name}</b>
      </h1>
      <div className="flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden">
      <img src={session?.user?.image} alt="" className="w-10 h-10"/>
      <span className="px-2">
      {session?.user?.name}
      </span>
      </div>
    </div>
  </Layout>
}
