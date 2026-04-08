"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { cloudinaryLoader } from "@/lib/cloudinary-client";

export default function AdminLiveVotes({ voteCounts, totalVoters }) {
  if (!voteCounts || voteCounts.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <p className="text-zinc-500 text-center text-sm">
          No votes yet — waiting for participants...
        </p>
        <div className="flex justify-center mt-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-zinc-700 border-t-amber-400 rounded-full"
          />
        </div>
      </div>
    );
  }

  const maxCount = voteCounts[0]?.count || 1;

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 text-sm font-medium">Live Vote Counts</h3>
        <span className="text-amber-400 text-sm font-bold">
          {totalVoters} vote{totalVoters !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        {voteCounts.map((v, i) => (
          <motion.div
            key={v.batchmate?._id || i}
            layout
            className="flex items-center gap-3"
          >
            {/* Rank */}
            <span className="text-zinc-600 text-xs w-5 text-right flex-shrink-0">
              {i + 1}
            </span>

            {/* Photo */}
            <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
              {v.batchmate?.photo?.url ? (
                <Image
                  loader={cloudinaryLoader}
                  src={v.batchmate.photo.url}
                  alt=""
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                  sizes="28px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600">
                  {v.batchmate?.name?.[0]}
                </div>
              )}
            </div>

            {/* Name + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white/80 text-xs truncate">
                  {v.batchmate?.name || "Unknown"}
                </span>
                <span className="text-amber-400 text-xs font-bold ml-2 flex-shrink-0">
                  {v.count}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  layout
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${(v.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
