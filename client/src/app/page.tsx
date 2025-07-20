export default function Home() {
  return (
    <div className="">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Welcome to Pingspot</h1>
        <div className="mt-3 flex w-full justify-center gap-5">
          <a href="/auth/login" className="bg-sky-700 p-4 text-white rounded-lg">Login</a>
          <a href="/auth/register" className="bg-sky-700 p-4 text-white rounded-lg">Register</a>
        </div>
      </div>
    </div>
  );
}
