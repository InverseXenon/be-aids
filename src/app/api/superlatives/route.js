import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import SuperlativeCategory from "@/models/SuperlativeCategory";
import Vote from "@/models/Vote";
import Batchmate from "@/models/Batchmate";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const withResults = searchParams.get("results") === "true";

  const categories = await SuperlativeCategory.find().populate("winnerId");

  if (withResults) {
    const results = await Promise.all(
      categories.map(async (cat) => {
        const votes = await Vote.aggregate([
          { $match: { categoryId: cat._id } },
          { $group: { _id: "$batchmateId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);
        const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);
        const enrichedVotes = await Promise.all(
          votes.map(async (v) => {
            const batchmate = await Batchmate.findById(v._id);
            return {
              batchmate: batchmate
                ? { _id: batchmate._id, name: batchmate.name, photo: batchmate.photo }
                : null,
              count: v.count,
              percentage: totalVotes > 0 ? Math.round((v.count / totalVotes) * 100) : 0,
            };
          })
        );
        return { ...cat.toObject(), results: enrichedVotes, totalVotes };
      })
    );
    return NextResponse.json(results);
  }

  return NextResponse.json(categories);
}

export async function POST(request) {
  await dbConnect();
  const { categoryId, batchmateId, sessionId } = await request.json();

  const category = await SuperlativeCategory.findById(categoryId);
  if (!category || !category.isOpen) {
    return NextResponse.json({ error: "Voting is closed for this category" }, { status: 400 });
  }

  const existing = await Vote.findOne({ categoryId, sessionId });
  if (existing) {
    return NextResponse.json({ error: "Already voted in this category" }, { status: 400 });
  }

  const vote = await Vote.create({ categoryId, batchmateId, sessionId });
  return NextResponse.json(vote, { status: 201 });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const { _id, ...updateData } = data;
  const category = await SuperlativeCategory.findByIdAndUpdate(_id, updateData, { new: true });
  return NextResponse.json(category);
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await Vote.deleteMany({ categoryId: id });
  await SuperlativeCategory.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
