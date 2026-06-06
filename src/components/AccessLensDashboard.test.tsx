import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoAccessReport } from "@/lib/accesslens/fixtures";
import { AccessLensDashboard } from "./AccessLensDashboard";

describe("AccessLensDashboard", () => {
  it("renders the exposure pack with findings, matrix, and export actions", () => {
    render(<AccessLensDashboard report={demoAccessReport} mode="fixture" />);

    expect(screen.getByRole("heading", { name: /accesslens/i })).toBeInTheDocument();
    expect(screen.getByText(/external elevated users/i)).toBeInTheDocument();
    expect(screen.getByText(/outside consultant/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download pdf/i })).toHaveAttribute("href", "/api/report/pdf");
    expect(screen.getByRole("link", { name: /download matrix/i })).toHaveAttribute("download", "accesslens-matrix.csv");
  });
});
