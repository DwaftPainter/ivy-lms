import { ImageResponse } from "next/og";

export const alt = "IVY LMS — IELTS Learning & Assessment Platform";
export const size = {
    width: 1200,
    height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "64px 72px",
                    background: "linear-gradient(135deg, #7f1616 0%, #a52222 55%, #b82b2b 100%)",
                    color: "#ffffff",
                    fontFamily: "sans-serif"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(255, 255, 255, 0.14)",
                            border: "1px solid rgba(255, 255, 255, 0.25)",
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: "0.06em"
                        }}
                    >
                        IVY IELTS
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "920px" }}>
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em"
                        }}
                    >
                        IVY LMS
                    </div>
                    <div
                        style={{
                            fontSize: 30,
                            lineHeight: 1.4,
                            color: "rgba(255, 255, 255, 0.9)"
                        }}
                    >
                        IELTS Learning, Timed Practice &amp; Rubric Grading Platform
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "24px",
                        fontSize: 20,
                        color: "rgba(255, 255, 255, 0.8)"
                    }}
                >
                    <span>Reading</span>
                    <span>•</span>
                    <span>Listening</span>
                    <span>•</span>
                    <span>Writing</span>
                    <span>•</span>
                    <span>Speaking</span>
                </div>
            </div>
        ),
        {
            ...size
        }
    );
}
