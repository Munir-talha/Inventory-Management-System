import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome Home</h1>
      <Image
        src="/login-image.png"
        alt="Dashboard"
        width={500}
        height={300}
        className="rounded-lg shadow-lg"
      />
      <p className="mt-6 text-lg text-gray-600">You're logged in. Let's manage some products!</p>
    </div>
  );
}
