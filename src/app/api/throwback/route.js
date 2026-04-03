import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  await dbConnect();
  const count = await Event.countDocuments();
  if (count === 0) {
    return NextResponse.json({ message: "No memories yet!", event: null });
  }
  const random = Math.floor(Math.random() * count);
  const event = await Event.findOne().skip(random);
  return NextResponse.json({ event });
}
