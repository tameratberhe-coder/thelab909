"""Generate the LAB 909 liability waiver PDF.

Run from repo root:
    python scripts/build_waiver.py

Outputs to client/public/lab909-waiver.pdf so it ships with the static build
and is reachable at /lab909-waiver.pdf in production.
"""
from __future__ import annotations

from pathlib import Path
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.enums import TA_LEFT

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "client" / "public" / "lab909-waiver.pdf"

RED = HexColor("#E11D2E")
BLACK = HexColor("#0A0A0A")
GREY = HexColor("#555555")

styles = {
    "h1": ParagraphStyle(
        "h1",
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=24,
        textColor=BLACK,
        spaceAfter=4,
    ),
    "eyebrow": ParagraphStyle(
        "eyebrow",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=RED,
        spaceAfter=10,
    ),
    "h2": ParagraphStyle(
        "h2",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=BLACK,
        spaceBefore=12,
        spaceAfter=4,
        textTransform="uppercase",
    ),
    "body": ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=BLACK,
        alignment=TA_LEFT,
    ),
    "small": ParagraphStyle(
        "small",
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=GREY,
    ),
}


def section(title: str, body_html: str):
    return [Paragraph(title.upper(), styles["h2"]), Paragraph(body_html, styles["body"])]


def field_row(label: str, width: float, height: float = 0.32):
    box = Table(
        [["", ""]],
        colWidths=[1.4 * inch, width],
        rowHeights=[height * inch],
    )
    box.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (1, 0), (1, 0), 0.5, BLACK),
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (0, 0), 9),
                ("TEXTCOLOR", (0, 0), (0, 0), BLACK),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    # rebuild with label text (Table allows Paragraph cells)
    box = Table(
        [[Paragraph(f"<b>{label}</b>", styles["body"]), ""]],
        colWidths=[1.4 * inch, width],
        rowHeights=[height * inch],
    )
    box.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (1, 0), (1, 0), 0.6, BLACK),
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    return box


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=LETTER,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.6 * inch,
        title="LAB 909 — Liability Waiver and Release",
        author="Perplexity Computer",
    )

    story = []

    # Header
    header = Table(
        [
            [
                Paragraph("THE LAB 909", ParagraphStyle("brand", fontName="Helvetica-Bold", fontSize=14, textColor=BLACK)),
                Paragraph("ALL WE KNOW IS <font color='#E11D2E'>WERK.</font>", ParagraphStyle("brandr", fontName="Helvetica-Bold", fontSize=10, alignment=2)),
            ]
        ],
        colWidths=[3.5 * inch, 3.5 * inch],
    )
    header.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 1.5, RED), ("BOTTOMPADDING", (0,0), (-1,-1), 6)]))
    story += [header, Spacer(1, 12)]

    story += [
        Paragraph("// PARTICIPANT AGREEMENT", styles["eyebrow"]),
        Paragraph("Liability Waiver, Release, and Assumption of Risk", styles["h1"]),
        Paragraph("Read carefully before signing. This is a legally binding document.", styles["small"]),
        Spacer(1, 14),
    ]

    story += section(
        "1. Activities Covered",
        "This waiver applies to all training, conditioning, sports performance, group, "
        "private, and family sessions conducted by The LAB 909, its coaches, contractors, "
        "agents, and at any facility, off-site location, or event organized by The LAB 909.",
    )

    story += section(
        "2. Acknowledgment of Risk",
        "I understand that strength training, sprint and agility work, plyometrics, "
        "Olympic lifting, conditioning, and sports performance training involve real risk "
        "of injury — including but not limited to muscle strains, sprains, fractures, "
        "concussions, dental injuries, heart events, heat illness, and in rare cases, "
        "permanent disability or death. I voluntarily assume these risks.",
    )

    story += section(
        "3. Medical Clearance",
        "I represent that I am physically able to participate, am not aware of any "
        "medical condition that would make participation unsafe, and have consulted a "
        "physician if needed. I will inform my coach of any injury, illness, surgery, "
        "pregnancy, medication, or condition that may affect my training, and update them "
        "if anything changes.",
    )

    story += section(
        "4. Release of Claims",
        "To the maximum extent allowed by California law, I release, waive, and discharge "
        "The LAB 909, its owners, employees, coaches, contractors, sponsors, and the "
        "owners of any premises used (collectively, “Released Parties”) from any and all "
        "claims, demands, or causes of action arising out of or related to my "
        "participation, including those caused by ordinary negligence. This release does "
        "not apply to gross negligence, willful misconduct, or anything that cannot be "
        "released by law.",
    )

    story += section(
        "5. Photo and Video Release (Optional)",
        "Initial here if you grant The LAB 909 permission to photograph and record video "
        "during sessions and to use that footage on its website, social media, and "
        "marketing materials, without compensation. You may revoke this consent in "
        "writing at any time for future use.",
    )

    initials_row = Table(
        [
            [Paragraph("<b>I CONSENT to photo/video use:</b>", styles["body"]), "", Paragraph("<b>I DECLINE photo/video use:</b>", styles["body"]), ""],
        ],
        colWidths=[2.0 * inch, 0.7 * inch, 1.8 * inch, 0.7 * inch],
    )
    initials_row.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (1, 0), (1, 0), 0.6, BLACK),
                ("LINEBELOW", (3, 0), (3, 0), 0.6, BLACK),
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story += [Spacer(1, 4), initials_row]

    story += section(
        "6. Dispute Resolution — Arbitration",
        "Any dispute arising out of this waiver or my participation will be resolved by "
        "binding arbitration in San Bernardino County, California, under JAMS rules. I "
        "waive the right to a jury trial and to participate in any class action.",
    )

    story += section(
        "7. Minor Participants",
        "If the participant is under 18, the parent or legal guardian agrees to all of "
        "the above on the minor’s behalf and represents they have legal authority to do so.",
    )

    story += section(
        "8. Severability and Governing Law",
        "If any portion of this waiver is held unenforceable, the remainder stays in "
        "effect. This waiver is governed by California law.",
    )

    # Signature block
    story += [Spacer(1, 18), Paragraph("PARTICIPANT INFORMATION", styles["h2"])]
    story += [
        field_row("Full name", 5.0 * inch),
        Spacer(1, 6),
        field_row("Date of birth", 2.5 * inch),
        Spacer(1, 6),
        field_row("Phone", 2.5 * inch),
        Spacer(1, 6),
        field_row("Email", 5.0 * inch),
        Spacer(1, 6),
        field_row("Emergency contact", 5.0 * inch),
        Spacer(1, 6),
        field_row("Emergency phone", 2.5 * inch),
        Spacer(1, 18),
    ]

    sig = Table(
        [
            [Paragraph("<b>Signature</b>", styles["body"]), "", Paragraph("<b>Date</b>", styles["body"]), ""],
            [Paragraph("<b>Parent/Guardian (if minor)</b>", styles["body"]), "", Paragraph("<b>Date</b>", styles["body"]), ""],
        ],
        colWidths=[1.5 * inch, 3.5 * inch, 0.6 * inch, 1.2 * inch],
        rowHeights=[0.45 * inch, 0.45 * inch],
    )
    sig.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (1, 0), (1, 0), 0.6, BLACK),
                ("LINEBELOW", (3, 0), (3, 0), 0.6, BLACK),
                ("LINEBELOW", (1, 1), (1, 1), 0.6, BLACK),
                ("LINEBELOW", (3, 1), (3, 1), 0.6, BLACK),
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story += [sig]

    story += [
        Spacer(1, 20),
        Paragraph(
            "The LAB 909 · Inland Empire, California · hello@thelab909.com · thelab909.com",
            styles["small"],
        ),
    ]

    doc.build(story)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
