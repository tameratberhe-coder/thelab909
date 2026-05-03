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
        "5. Photo, Video, Audio, Likeness and Publicity Release (Mandatory)",
        "By signing this Agreement, I irrevocably and unconditionally grant to The LAB 909 "
        "and its owners, employees, coaches, contractors, successors, assigns, licensees, "
        "sponsors, partners, and anyone authorized by The LAB 909 (collectively, \u201cReleased "
        "Parties\u201d) the perpetual, worldwide, royalty-free, fully paid-up, sublicensable, "
        "transferable, and irrevocable right and license to photograph, film, audio-record, "
        "video-record, livestream, and otherwise capture and reproduce my (and, if a "
        "minor, my child\u2019s) name, voice, likeness, image, photograph, video, performance, "
        "statements, biographical information, signature, and any other identifying "
        "attributes (collectively, \u201cMy Likeness\u201d) before, during, and after any session, "
        "event, or visit to any LAB 909 facility or related premises. I further grant the "
        "unrestricted right to edit, alter, modify, copy, exhibit, publish, distribute, "
        "display, perform, broadcast, and create derivative works from My Likeness, in "
        "whole or in part, alone or in combination with any other content, in any and all "
        "media now known or hereafter invented (including without limitation print, "
        "television, film, internet, social media, streaming, podcasts, mobile applications, "
        "virtual reality, the metaverse, AI training data, advertising, signage, packaging, "
        "and merchandise), in any and all markets and territories, throughout the universe, "
        "in perpetuity, for any purpose whatsoever \u2014 commercial, promotional, editorial, "
        "educational, or otherwise \u2014 without further notice, approval, compensation, "
        "royalty, attribution, or accounting to me. "
        "<br/><br/>"
        "I acknowledge that I will <b>not</b> receive any payment, residual, royalty, profit "
        "share, or other consideration of any kind for any current or future use of My "
        "Likeness, and that the access to training, coaching, and the LAB 909 facility "
        "itself is full and adequate consideration for this release. I waive any right to "
        "inspect, review, or approve any photograph, recording, edit, caption, or finished "
        "product before publication. "
        "<br/><br/>"
        "I irrevocably and forever release, waive, and discharge the Released Parties from "
        "any and all claims, damages, demands, liabilities, losses, costs, fees (including "
        "attorneys\u2019 fees), and causes of action of any kind, whether known or unknown, "
        "existing now or arising in the future, that I, my heirs, my estate, my assigns, or "
        "anyone acting on my behalf may have against the Released Parties arising out of "
        "or relating to the capture, use, reuse, modification, or distribution of My "
        "Likeness \u2014 including without limitation any claim for invasion of privacy, "
        "intrusion, public disclosure of private facts, false light, defamation, libel, "
        "slander, infliction of emotional distress, copyright infringement, right of "
        "publicity (including under California Civil Code \u00a7 3344 and any common-law right "
        "of publicity), trademark, unfair competition, misappropriation, blurring, "
        "unauthorized commercial use, breach of contract, negligence, or any other legal "
        "or equitable theory \u2014 even if such claim is caused in whole or in part by the "
        "Released Parties\u2019 own negligence. To the maximum extent permitted by law, I "
        "expressly waive the protections of California Civil Code \u00a7 1542, which provides: "
        "\u201cA general release does not extend to claims that the creditor or releasing party "
        "does not know or suspect to exist in his or her favor at the time of executing the "
        "release and that, if known by him or her, would have materially affected his or "
        "her settlement with the debtor or released party.\u201d "
        "<br/><br/>"
        "I further waive and disclaim any moral rights, droit moral, attribution rights, "
        "integrity rights, or similar rights I may have in My Likeness or any work "
        "incorporating it. To the extent any such right cannot be waived, I covenant not "
        "to assert it. "
        "<br/><br/>"
        "I represent and warrant that I am the sole owner of all rights in My Likeness, "
        "that I have the full legal authority to grant this release (and, if signing on "
        "behalf of a minor, that I am the parent or legal guardian with full authority to "
        "bind the minor and the minor\u2019s estate), and that no third party\u2019s consent is "
        "required. I agree to indemnify, defend, and hold harmless the Released Parties "
        "from any claim, demand, loss, or expense (including attorneys\u2019 fees) arising out "
        "of any breach of this representation. "
        "<br/><br/>"
        "<b>This Section 5 is mandatory.</b> It is a material condition of my participation in "
        "any LAB 909 program, training, or event. I cannot opt out of this Section 5 while "
        "continuing to participate. This release is irrevocable and perpetual. It survives "
        "the termination of any membership, booking, employment, or relationship with The "
        "LAB 909 and is binding on me, my heirs, my estate, my executors, my "
        "administrators, my successors, and my assigns.",
    )

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
