import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import ArchiveItem from "@/models/ArchiveItem";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const filter = {};
  if (year) filter.year = parseInt(year);
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: "i" };
  const items = await ArchiveItem.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const item = await ArchiveItem.create(data);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await ArchiveItem.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
