import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const tag = searchParams.get("tag");
  const type = searchParams.get("type");
  const filter = {};
  if (year) filter.year = parseInt(year);
  if (tag) filter.tags = { $in: [tag] };
  if (type) filter.type = type;
  const media = await Media.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(media);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const media = await Media.create(data);
  return NextResponse.json(media, { status: 201 });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await Media.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
