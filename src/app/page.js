import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome to the Login Page</h1>
      <Image
        src="/login-image.png"
        alt="Login Image"
        width={500}
        height={300}
        className="rounded-lg shadow-lg"
      />
      <p className="mt-6 text-lg text-gray-600">Please log in to continue.</p>
    </main>
  );
}