/*import Image from "next/image";


export default function Navbar () {
  return (
    <div className="bg-black center fixed top-0 w-full  flex items-start h-20  ">
      <div className="absolute left-4 flex items-center ml-4">
        <Image src="/assets/logo.png" alt="Logo" width={67} height={60} />
        <div className="text-white  ml-2 ">
          <div className="text-2xl font-semibold">EN PASSANT</div>
          <div className="text-sm opacity-90 ">Chess Tournament</div> 
        </div>
      </div>
      <div className="absolute right-4 text-white  flex items-center gap-10 flex items-start gap-20 mr-14 text-2xl">
        <a href="/#" className="group flex items-center gap-2 cursor-pointer  text-center justify-center p-2 rounded-lg transition-all duration-300 ease-in-out hover:text-black hover:bg-[#EAC360]">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" className="stroke-white group-hover:stroke-black transition-colors duration-300">
		        <path fill="none" d="M11.5 19v-3.754q-1.379-.102-2.399-.999t-1.278-2.258q-1.587-.187-2.705-1.301T4 8v-.385q0-.666.475-1.14T5.615 6h2.039v-.385q0-.666.474-1.14Q8.603 4 9.27 4h5.462q.666 0 1.14.475q.475.474.475 1.14V6h2.039q.666 0 1.14.475T20 7.615V8q0 1.573-1.118 2.688t-2.705 1.3q-.258 1.362-1.278 2.259t-2.399 1V19h2.616q.212 0 .356.144t.144.357t-.144.356t-.356.143H8.885q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143zm-3.846-8.084V7H5.615q-.269 0-.442.173T5 7.616V8q0 1.123.762 1.953q.761.83 1.892.963m4.35 3.353q1.38 0 2.342-.965q.962-.964.962-2.343V5.616q0-.27-.174-.443Q14.962 5 14.692 5H9.308q-.27 0-.442.173q-.174.173-.174.443v5.346q0 1.378.966 2.343q.967.964 2.347.964m4.341-3.353q1.131-.133 1.893-.963Q19 9.123 19 8v-.385q0-.269-.173-.442T18.385 7h-2.039zM12 9.635" strokeWidth="1.3"  />
	        </svg>

          Home
        </a>
        <a href="/#tournaments" className="group flex items-center gap-2 cursor-pointer  text-center justify-center p-2 rounded-lg transition-all duration-300 ease-in-out hover:text-black hover:bg-[#EAC360]" >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" className="stroke-white group-hover:stroke-black transition-colors duration-300">
		        <path fill="none" d="M107.19 159a56 56 0 1 0-46.38 0a91.83 91.83 0 0 0-53.93 38.81a4 4 0 1 0 6.7 4.37a84 84 0 0 1 140.84 0a4 4 0 1 0 6.7-4.37A91.83 91.83 0 0 0 107.19 159M36 108a48 48 0 1 1 48 48a48.05 48.05 0 0 1-48-48m212 95.35a4 4 0 0 1-5.53-1.17A83.81 83.81 0 0 0 172 164a4 4 0 0 1 0-8a48 48 0 1 0-17.82-92.58a4 4 0 1 1-3-7.43a56 56 0 0 1 44 103a91.83 91.83 0 0 1 53.93 38.86a4 4 0 0 1-1.11 5.5" strokeWidth="20"   />
	        </svg>
          Leaderboard
        </a>
        <a href="/#games" className="group flex items-center gap-2 cursor-pointer  text-center justify-center p-2 rounded-lg transition-all duration-300 ease-in-out hover:text-black hover:bg-[#EAC360]" >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="stroke-white group-hover:stroke-black transition-colors duration-300">
		        <path fill="none" d="M5 3h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v3h5V4zM3 19a2 2 0 0 0 2 2h3v-5H3zm5-9H3v5h5zm10 11a2 2 0 0 0 2-2v-3h-5v5zm2-11h-5v5h5zm0-4a2 2 0 0 0-2-2h-3v5h5zM9 4v5h5V4zm0 17h5v-5H9zm5-11H9v5h5z" stroke-width="1.3"  />
	        </svg>
           Games
        </a>

      </div>

    </div>
  );
};*/
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname(); // Get current URL path

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Leaderboard", href: "/tournaments" },
    { name: "Games", href: "/games" },
  ];

  return (
    <div className="bg-black fixed top-0 w-full flex items-start h-20 ">
      {/* Logo */}
      <div className="absolute left-4 flex items-center ml-4">
        <Image src="/assets/logo.png" alt="Logo" width={67} height={60} />
        <div className="text-white ml-2">
          <div className="text-2xl font-semibold">EN PASSANT</div>
          <div className="text-sm opacity-90">Chess Tournament</div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="absolute right-4 text-white  flex items-center gap-10  gap-20 mr-14 text-2xl top-1/2 transform -translate-y-1/2">
        {navItems.map((item) => {
          const isActive = pathname === item.href; // Active link check

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-2 cursor-pointer text-center justify-center p-2 rounded-lg transition-all duration-300 ease-in-out
                ${
                  isActive
                    ? "bg-[#EAC360] text-black"
                    : "text-white hover:text-black hover:bg-[#EAC360]"
                }`}
            >
              {/* Example: adjust icons per link */}
              {item.name === "Home" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  className={`transition-colors duration-300 ${
                  isActive ? "stroke-black" : "stroke-white group-hover:stroke-black"
                  }`}
                >
                  <path
                    fill="none"
                    d="M11.5 19v-3.754q-1.379-.102-2.399-.999t-1.278-2.258q-1.587-.187-2.705-1.301T4 8v-.385q0-.666.475-1.14T5.615 6h2.039v-.385q0-.666.474-1.14Q8.603 4 9.27 4h5.462q.666 0 1.14.475q.475.474.475 1.14V6h2.039q.666 0 1.14.475T20 7.615V8q0 1.573-1.118 2.688t-2.705 1.3q-.258 1.362-1.278 2.259t-2.399 1V19h2.616q.212 0 .356.144t.144.357t-.144.356t-.356.143H8.885q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143zm-3.846-8.084V7H5.615q-.269 0-.442.173T5 7.616V8q0 1.123.762 1.953q.761.83 1.892.963m4.35 3.353q1.38 0 2.342-.965q.962-.964.962-2.343V5.616q0-.27-.174-.443Q14.962 5 14.692 5H9.308q-.27 0-.442.173q-.174.173-.174.443v5.346q0 1.378.966 2.343q.967.964 2.347.964m4.341-3.353q1.131-.133 1.893-.963Q19 9.123 19 8v-.385q0-.269-.173-.442T18.385 7h-2.039zM12 9.635"
                    strokeWidth="1.3"
                  />
                </svg>
              )}

              {item.name === "Leaderboard" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 256 256"
                  className={`transition-colors duration-300 ${
                  isActive ? "stroke-black" : "stroke-white group-hover:stroke-black"
                  }`}
                >
                  <path
                    fill="none"
                    d="M107.19 159a56 56 0 1 0-46.38 0a91.83 91.83 0 0 0-53.93 38.81a4 4 0 1 0 6.7 4.37a84 84 0 0 1 140.84 0a4 4 0 1 0 6.7-4.37A91.83 91.83 0 0 0 107.19 159M36 108a48 48 0 1 1 48 48a48.05 48.05 0 0 1-48-48m212 95.35a4 4 0 0 1-5.53-1.17A83.81 83.81 0 0 0 172 164a4 4 0 0 1 0-8a48 48 0 1 0-17.82-92.58a4 4 0 1 1-3-7.43a56 56 0 0 1 44 103a91.83 91.83 0 0 1 53.93 38.86a4 4 0 0 1-1.11 5.5"
                    strokeWidth="20"
                  />
                </svg>
              )}

              {item.name === "Games" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className={`transition-colors duration-300 ${
                  isActive ? "stroke-black" : "stroke-white group-hover:stroke-black"
                  }`}
                >
                  <path
                    fill="none"
                    d="M5 3h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v3h5V4zM3 19a2 2 0 0 0 2 2h3v-5H3zm5-9H3v5h5zm10 11a2 2 0 0 0 2-2v-3h-5v5zm2-11h-5v5h5zm0-4a2 2 0 0 0-2-2h-3v5h5zM9 4v5h5V4zm0 17h5v-5H9zm5-11H9v5h5z"
                    strokeWidth="1.3"
                  />
                </svg>
              )}

              {/* Link text */}
              <span className="transition-colors duration-300 font-semibold">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
