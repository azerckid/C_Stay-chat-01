import { type MetaFunction } from "react-router";
import { SafeArea, BottomNav } from "../components/layout";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, Settings02Icon, Location01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "STAYnC - Travel Home" },
        { name: "description", content: "Discover amazing destinations and plan your perfect trip" },
    ];
};

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");

    // Sample data - 실제로는 API나 데이터베이스에서 가져올 데이터
    const popularDestinations = [
        {
            id: 1,
            name: "Kyoto",
            location: "Japan",
            category: "Historical",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe8WgURqfpuA29_fwqsvtnIKZNgWJb8FRMCCXAgQF82VMDlkQ-BNxfbf5_t-NN3CSU5Uyo5eGOujG9NFftX0mCyi_uE2T3ZYsPZyJe0dvqB0ph1Ldutujf3bR-vPqe_94T7BSh5DjeCPcTZjUKx_d7UiB1ROe_H5HkU6ZV8VazwmXdWC4tW4RpzJhN_YNWW9nLoQrMxg2Hy1-5Ol6-bIyYq9CGTMvnpsk1GaT2ewwu3pWAkSkxyfdkc_JtSfB8J05erNmrhXKoWld-",
        },
        {
            id: 2,
            name: "Cinque Terre",
            location: "Italy",
            category: "Coastal",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq6oAi4yU42sEHXIRo6b_Eov-4Ecq_IAGaiaTdq7Uz9MfcghBqf6GzRj3PU83C1VzpndQB7zDNQqSKRzw8PeU7UCqRgPptdWCwNhK8VONHhk-xavgsNy2P1FPwdNgOF7GU-GrUEzB9ufFss-6_6-ZAiJ7c5BOeKu_4ioatbdEW-C9Rv3BgGrmbb6diiBNrAWhFhNukh1PYNtcIhMtzX7rIacqHyQfuG9Dg2h4dRHSzQ-btCl1ULM5Z3Whd1RGFoDSsz88Nv4kvdu20",
        },
        {
            id: 3,
            name: "Sydney",
            location: "Australia",
            category: "Urban",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxZ3vyr_OYKVfgIcCZCsCLZ23ExxMyGqNY4Pn88IDmhA-CQivNN_zRqtXi1C2JS54Ga2bnz4erct9PgcLoV_OEKg6dKO8CkjfWZZp23YP2Vvz3XmgQpBTzoKsjzAoWTCjqt1Za9LKqK1UGwaFF1NbDhe40Tf21jlSmVDyuFoPM7PCpzI1dAtLrPfggHzt28SilwM1cN3zDfZ6ZRnT7uNxF_D96nRW-xibreJo075zYihCaQxJboa9hz01198R9ArkCWxxIVXMwcuoJ",
        },
    ];

    const popularStays = [
        {
            id: 1,
            name: "Oceanview Resort",
            location: "Maldives",
            rating: 4.9,
            price: 320,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDv3X4_9TLPNDWpI9Mnam9Y8cPR0zqXpypVs1WmNcSYjTmhx65WcFSLP2A7F3KrDOVMgqrbhm9DrYUebNymK0fL2SXSZ09ECUimI4qPNzq3cO7cASQieilO5MGLHaaZLzE_iU5o_59zysZhhita1KZb_Rl_clLCmqfgFFiH6G-XfVrxzCgJtPdAtdEN2_hQObMyH4rWJBEW9RdLZ8bqhVwBfMD2AI1V83179M43EOBmTqhytg4SS8JLfc5i-M9x7ECVu_NNFkWiCtZT",
        },
        {
            id: 2,
            name: "The Alpine Lodge",
            location: "Switzerland",
            rating: 4.8,
            price: 450,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDparDbJejnBrOeT1aGEG4a9ImuUYY-GPCviVQjfpnJbrAJ_NA1mFUA6qva15L2HERpHWjpkdMLh4P5paD0iBWuFCUDZ5XpO7mqkz-5jXMENzbOb52GsaqBxrhmYw6QjhDwzSjBlf85B_lfv2uzhJDzKnGCqzrOgmiMOXrMZtfqrtFLC-HCMXRiCfZHSOWlofwOil0DD05HOd0r9-cZw1ed2vAfEUuewe5YrW7JMWpF66P6NBdnKDSrPusMzstFWjySWpgI8dmUpn_G",
        },
    ];

    const flightDeals = [
        {
            id: 1,
            from: "NYC",
            to: "LON",
            airline: "British Airways",
            type: "Direct",
            price: 450,
            originalPrice: 680,
            iconColor: "bg-red-100 dark:bg-red-900/30 text-primary",
        },
        {
            id: 2,
            from: "SFO",
            to: "TYO",
            airline: "ANA",
            type: "1 Stop",
            price: 820,
            originalPrice: 1100,
            iconColor: "bg-blue-100 dark:bg-blue-900/30 text-secondary",
        },
    ];

    return (
        <SafeArea className="bg-[#F3F4F6] dark:bg-[#111827] flex flex-col h-screen overflow-hidden">
            {/* Header - Search */}
            <header className="px-6 pb-2 pt-4 bg-[#F3F4F6] dark:bg-[#111827] z-10 sticky top-0">
                <div className="w-full relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HugeiconsIcon icon={SearchIcon} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Where do you want to go?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 border-none rounded-xl leading-5 bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <HugeiconsIcon icon={Settings02Icon} className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-6">
                {/* Today's Popular */}
                <div className="pt-2">
                    <div className="px-6 flex justify-between items-end mb-3">
                        <h2 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Today's Popular</h2>
                        <Link to="#" className="text-xs font-semibold text-primary hover:underline">
                            See All
                        </Link>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar px-6 pb-4">
                        {popularDestinations.map((destination) => (
                            <div
                                key={destination.id}
                                className="relative min-w-[200px] h-[260px] rounded-2xl overflow-hidden shadow-md group cursor-pointer"
                            >
                                <img
                                    alt={destination.name}
                                    src={destination.image}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-medium text-white mb-2">
                                        {destination.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-white">{destination.name}</h3>
                                    <div className="flex items-center text-gray-300 text-xs mt-1">
                                        <HugeiconsIcon icon={Location01Icon} className="w-[14px] h-[14px] mr-1" />
                                        {destination.location}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Stays */}
                <div>
                    <div className="px-6 flex justify-between items-end mb-3">
                        <h2 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Popular Stays</h2>
                        <Link to="#" className="text-xs font-semibold text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar px-6 pb-2">
                        {popularStays.map((stay) => (
                            <div
                                key={stay.id}
                                className="min-w-[240px] bg-white dark:bg-[#1F2937] rounded-xl p-3 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer"
                            >
                                <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                                    <img alt={stay.name} src={stay.image} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded flex items-center shadow-sm">
                                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-xs font-bold ml-0.5 text-gray-800 dark:text-white">{stay.rating}</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-[#111827] dark:text-[#F9FAFB] truncate">{stay.name}</h3>
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] flex items-center mt-1">
                                    <HugeiconsIcon icon={Location01Icon} className="w-[14px] h-[14px] mr-1 text-gray-400" />
                                    {stay.location}
                                </p>
                                <div className="mt-2 flex items-end justify-between">
                                    <div className="text-primary font-bold text-sm">
                                        ${stay.price}
                                        <span className="text-gray-400 font-normal text-xs">/night</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Special Flight Deals */}
                <div className="px-6 pb-6">
                    <h2 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB] mb-3">Special Flight Deals</h2>
                    <div className="space-y-3">
                        {flightDeals.map((deal) => (
                            <div
                                key={deal.id}
                                className="bg-white dark:bg-[#1F2937] rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full ${deal.iconColor} flex items-center justify-center`}>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-[#111827] dark:text-[#F9FAFB]">{deal.from}</span>
                                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3 text-gray-400" />
                                            <span className="font-bold text-[#111827] dark:text-[#F9FAFB]">{deal.to}</span>
                                        </div>
                                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                                            {deal.airline} • {deal.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-primary">${deal.price}</span>
                                    <span className="text-[10px] text-gray-400 line-through">${deal.originalPrice}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <BottomNav />
        </SafeArea>
    );
}
