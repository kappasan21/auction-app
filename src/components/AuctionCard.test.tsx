import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AuctionCard from "./AuctionCard";

describe("AuctionCard", () => {
  it("renders auction data", () => {
    render(
      <AuctionCard
        auction={{
          id: "1",
          title: "Vintage Synth",
          description: "Rare analog synth in great condition.",
          category: "Electronics",
          currentPrice: 45000,
          status: "active",
          imageUrl: null,
          endAt: new Date().toISOString(),
        }}
      />
    );

    expect(screen.getByText("Vintage Synth")).toBeInTheDocument();
    expect(screen.getByText("Current bid")).toBeInTheDocument();
  });
});
