import { describe, it, expect } from "vitest";

describe("Client Testing", () => {
  it("should calculate available rooms correctly", () => {
    const totalRooms = 10;
    const bookedRooms = 4;

    const availableRooms = totalRooms - bookedRooms;

    expect(availableRooms).toBe(6);
  });
});