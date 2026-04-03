import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const category = searchParams.get("category");
  const filter = {};
  if (year) filter.year = parseInt(year);
  if (category) filter.category = category;
  const events = await Event.find(filter).sort({ date: 1 });
  return NextResponse.json(events);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const event = await Event.create(data);
  return NextResponse.json(event, { status: 201 });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const data = await request.json();
  const { _id, ...updateData } = data;
  const event = await Event.findByIdAndUpdate(_id, updateData, { new: true });
  return NextResponse.json(event);
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await Event.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
