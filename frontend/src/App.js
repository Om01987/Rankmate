// src/App.js

const API_URL = process.env.REACT_APP_API_URL;

import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CandidateProfile from "./components/CandidateProfile";
import AnalysisSummary from "./components/AnalysisSummary";
import ErrorMessage from "./components/ErrorMessage";
import AnimatedBackground from "./components/AnimatedBackground";
import QuestionList from "./components/QuestionList";
import ExamSelector from "./components/ExamSelector";
import SectionAnalysisTable from "./components/SectionAnalysisTable";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [detailsHtml, setDetailsHtml] = useState("");
  const [candidateInfoHtml, setCandidateInfoHtml] = useState(""); // NEW
  const [candidateBasicInfo, setCandidateBasicInfo] = useState(""); // NEW - for left column
  const [candidatePhotos, setCandidatePhotos] = useState(""); // NEW - for right column
  const [sectionedDetails, setSectionedDetails] = useState(null); // NEW
  const [questionDetails, setQuestionDetails] = useState([]); // NEW - for section analysis
  const detailsRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    wrong: false,
    unattempted: false,
  });
  const [selectedExam, setSelectedExam] = useState("phase13");
  const [customMarks, setCustomMarks] = useState({ correct: "", wrong: "" });

  // Function to extract question text from HTML
  const extractQuestionText = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Try to find question text in various possible elements
    const questionSelectors = [
      ".qstn-body",
      ".question",
      "h3",
      "h4",
      "p",
      'div[style*="font-weight"]',
      'td[style*="font-weight"]',
      "td",
      "div",
    ];

    for (const selector of questionSelectors) {
      const elements = doc.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent.trim();
        if (
          text &&
          text.length > 30 &&
          !text.includes("Chosen Option") &&
          !text.includes("Correct Answer") &&
          !text.includes("Question Type") &&
          !text.includes("Question ID") &&
          !text.match(/^[1-4]\.\s*$/) && // Not just option numbers
          !text.match(/^[A-D]\.\s*$/) && // Not just option letters
          !text.includes("✓") &&
          !text.includes("✗")
        ) {
          return text;
        }
      }
    }

    // Fallback: get first meaningful text content
    const allElements = doc.querySelectorAll("*");
    for (const el of allElements) {
      const text = el.textContent.trim();
      if (
        text &&
        text.length > 20 &&
        !text.includes("Chosen Option") &&
        !text.includes("Correct Answer") &&
        !text.includes("Question Type") &&
        !text.includes("Question ID")
      ) {
        return text;
      }
    }

    return "Question text not found";
  };

  // Function to extract question text directly from a DOM panel element
  const extractQuestionTextFromPanel = (panel) => {
    // Method 1: Find the question text td element (most reliable)
    const questionTds = panel.querySelectorAll('td.bold[valign="top"]');
    for (const td of questionTds) {
      const text = td.textContent.trim();
      // Check if this td contains question text (not question number, not answer label)
      if (
        text &&
        text.length > 10 &&
        !text.match(/^Q\.\d+$/) && // Not question number like "Q.23"
        !text.includes("Ans") && // Not answer label
        !text.match(/^[1-4]\.\s*\d+$/) && // Not option like "1. 224"
        !text.includes("Chosen Option") &&
        !text.includes("Correct Answer") &&
        !text.includes("Question Type") &&
        !text.includes("Question ID") &&
        !text.includes("Status") &&
        !text.includes("Answered") &&
        !text.includes("Not Answered")
      ) {
        return text;
      }
    }

    // Method 2: Look for td with bold class and text-align left style
    const leftAlignedTds = panel.querySelectorAll(
      'td.bold[style*="text-align: left"]'
    );
    for (const td of leftAlignedTds) {
      const text = td.textContent.trim();
      if (
        text &&
        text.length > 10 &&
        !text.match(/^Q\.\d+$/) && // Not question number
        !text.includes("Ans") && // Not answer label
        !text.match(/^[1-4]\.\s*\d+$/) && // Not option
        !text.includes("Chosen Option") &&
        !text.includes("Correct Answer") &&
        !text.includes("Question Type") &&
        !text.includes("Question ID") &&
        !text.includes("Status")
      ) {
        return text;
      }
    }

    // Method 3: Find the second td.bold in the question row (question text is usually the second td)
    const questionRow = panel.querySelector('tr:has(td[width="7%"])');
    if (questionRow) {
      const tds = questionRow.querySelectorAll("td.bold");
      if (tds.length >= 2) {
        const secondTd = tds[1]; // Second td should be the question text
        const text = secondTd.textContent.trim();
        if (
          text &&
          text.length > 10 &&
          !text.match(/^Q\.\d+$/) && // Not question number
          !text.includes("Ans") && // Not answer label
          !text.match(/^[1-4]\.\s*\d+$/) && // Not option
          !text.includes("Chosen Option") &&
          !text.includes("Correct Answer") &&
          !text.includes("Question Type") &&
          !text.includes("Question ID") &&
          !text.includes("Status")
        ) {
          return text;
        }
      }
    }

    // Method 4: Fallback - search all elements for meaningful text
    const allElements = panel.querySelectorAll("*");
    for (const el of allElements) {
      const text = el.textContent.trim();
      if (
        text &&
        text.length > 20 &&
        !text.match(/^Q\.\d+$/) && // Not question number
        !text.includes("Ans") && // Not answer label
        !text.match(/^[1-4]\.\s*\d+$/) && // Not option
        !text.includes("Chosen Option") &&
        !text.includes("Correct Answer") &&
        !text.includes("Question Type") &&
        !text.includes("Question ID") &&
        !text.includes("Status") &&
        !text.includes("Answered") &&
        !text.includes("Not Answered") &&
        !text.includes("Option 1") &&
        !text.includes("Option 2") &&
        !text.includes("Option 3") &&
        !text.includes("Option 4")
      ) {
        return text;
      }
    }

    return "Question text not found";
  };

  // Function to copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log("Question copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  // Set up global copy function for buttons
  useEffect(() => {
    window.copyQuestionText = (buttonId, questionText) => {
      console.log("Copying question text:", questionText); // Debug log
      copyToClipboard(questionText);

      // Visual feedback - change button text temporarily
      const button = document.getElementById(buttonId);
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = "✅ Copied!";
        button.style.background =
          "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        button.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";

        setTimeout(() => {
          button.innerHTML = originalText;
          button.style.background =
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
          button.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
        }, 2000);
      }
    };

    // Cleanup function
    return () => {
      delete window.copyQuestionText;
    };
  }, []);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Validate URL format
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Remove the removeTechnicalRows function and revert fixImageSrcAndHighlight to only fix image src and highlight rightAns
  function fixImageSrcAndHighlight(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const imgs = doc.querySelectorAll("img");
    imgs.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !src.startsWith("http") && !src.startsWith("data:")) {
        try {
          img.src = new URL(src, baseUrl).href;
        } catch (e) {
          // If baseUrl is invalid, leave src as is
        }
      }
    });
    // --- Block style for menu-tbl positioned at bottom right and clean up rows ---
    const menuTbls = doc.querySelectorAll("table.menu-tbl");
    menuTbls.forEach((tbl) => {
      // Override all inline styles and set compact positioning with colorful design
      tbl.setAttribute(
        "style",
        `
        float: right !important;
        margin: 1rem 0 0.5rem 0 !important;
        display: block !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
        width: auto !important;
        min-width: fit-content !important;
        max-width: none !important;
        text-align: left !important;
        border: 2px solid #10b981 !important;
        font-size: 0.9em !important;
        padding: 1.2rem !important;
        position: relative !important;
        z-index: 10 !important;
        table-layout: auto !important;
        border-collapse: collapse !important;
        font-family: 'Inter', sans-serif !important;
        backdrop-filter: blur(10px) !important;
      `
      );

      // Fix text breaking in status box - make cells dynamic with better styling
      const statusCells = tbl.querySelectorAll("td");
      statusCells.forEach((cell) => {
        cell.style.whiteSpace = "nowrap !important";
        cell.style.wordBreak = "keep-all !important";
        cell.style.overflow = "visible !important";
        cell.style.textOverflow = "clip !important";
        cell.style.width = "auto !important";
        cell.style.minWidth = "fit-content !important";
        cell.style.textAlign = "left !important";
        cell.style.padding = "6px 10px 6px 0 !important";
        cell.style.color = "#ffffff !important";
        cell.style.border = "none !important";
        cell.style.fontSize = "0.95em !important";
        cell.style.verticalAlign = "middle !important";
        cell.style.fontWeight = "700 !important";
        cell.style.background = "transparent !important";
        cell.style.display = "block !important";
        cell.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.1) !important";
      });

      // Remove unwanted rows FIRST
      const allRows = Array.from(tbl.querySelectorAll("tr"));
      allRows.forEach((row) => {
        const firstCell = row.querySelector("td");
        if (firstCell) {
          const text = firstCell.textContent.trim().toLowerCase();
          if (
            text === "question type :" ||
            text === "question id :" ||
            text.startsWith("option 1 id") ||
            text.startsWith("option 2 id") ||
            text.startsWith("option 3 id") ||
            text.startsWith("option 4 id")
          ) {
            row.remove();
          }

          // Remove "Chosen Option" row if it's "--" or null (unattempted question)
          if (text.includes("chosen option")) {
            const nextCell = row.querySelector("td:nth-child(2)");
            if (nextCell) {
              const chosenValue = nextCell.textContent.trim();
              if (
                chosenValue === "--" ||
                chosenValue === "" ||
                chosenValue === "null"
              ) {
                row.remove();
              }
            }
          }
        }
      });

      // Convert remaining table to single column layout
      const remainingRows = Array.from(tbl.querySelectorAll("tr"));
      remainingRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          // Combine the text from both cells
          const label = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          const combinedText = `${label} ${value}`;

          // Clear the row and add single cell
          row.innerHTML = "";
          const newCell = document.createElement("td");
          newCell.textContent = combinedText;
          newCell.style.cssText = `
            color: #ffffff !important;
            border: none !important;
            font-size: 0.95em !important;
            text-align: left !important;
            padding: 6px 10px 6px 0 !important;
            width: auto !important;
            white-space: nowrap !important;
            vertical-align: middle !important;
            font-weight: 700 !important;
            background: transparent !important;
            display: block !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
          `;
          row.appendChild(newCell);
        }
      });
    });
    // --- End block style ---
    // Style the question card background (super clean design)
    const questionPanels = doc.querySelectorAll(".question-pnl");
    questionPanels.forEach((panel) => {
      panel.setAttribute(
        "style",
        `
        background: #ffffff !important;
        border-radius: 20px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
        border: none !important;
        padding: 2.5rem !important;
        margin-bottom: 2.5rem !important;
        color: #1a1a1a !important;
        font-size: 1.1rem !important;
        position: relative !important;
        font-family: 'Inter', sans-serif !important;
        line-height: 1.6 !important;
      `
      );

      // Clean up all elements within question panel
      const allEls = panel.querySelectorAll("*");
      allEls.forEach((el) => {
        if (el.style) {
          el.style.background = "transparent !important";
          el.style.backgroundColor = "transparent !important";
          el.style.color = "#1a1a1a !important";
          el.style.fontFamily = "Inter, sans-serif !important";
        }

        // Remove all inline background styles
        if (el.getAttribute("style")) {
          let style = el.getAttribute("style");
          style = style.replace(/background[^;]*;/g, "");
          style = style.replace(/background-color[^;]*;/g, "");
          style = style.replace(/color[^;]*;/g, "");
          el.setAttribute(
            "style",
            style +
              "; color: #1a1a1a !important; background: transparent !important;"
          );
        }
      });
    });
    // Find the chosen option number from the panel FIRST - SIMPLER METHOD
    let chosenNum = null;

    // Search for "Chosen Option" text anywhere in the document
    const allText = doc.body.textContent;

    // Look for "Chosen Option : X" pattern
    const chosenMatch = allText.match(/Chosen Option\s*:\s*(\d+)/i);
    if (chosenMatch) {
      chosenNum = chosenMatch[1];
    }

    // If not found, try alternative patterns
    if (!chosenNum) {
      const altMatch = allText.match(/Chosen Option\s+(\d+)/i);
      if (altMatch) {
        chosenNum = altMatch[1];
      }
    }

    // Make all options super clean and readable - PRESERVE IMAGES
    const allOptions = doc.querySelectorAll(".rightAns, .wrngAns");
    allOptions.forEach((el, idx) => {
      // Extract option number from original text FIRST
      const originalText = el.textContent;
      const optionMatch = originalText.match(/^(\d+)\./);
      const originalOptionNumber = optionMatch
        ? optionMatch[1]
        : (idx + 1).toString();

      // PRESERVE IMAGES - Get the original HTML content instead of just text
      const originalHTML = el.innerHTML;

      // Clean the content but preserve images
      let cleanContent = originalHTML
        .replace(/^\d+\.\s*/, "") // Remove original number-dot pattern first
        .replace(/[✓✗❌✅×]/g, "") // Remove all check/cross symbols
        .replace(/^\s*[✗✓❌✅×]\s*/, "") // Remove leading symbols
        .replace(/^\s*[Xx]\s*/, "") // Remove leading X
        .replace(/\s*[Xx]\s*$/, "") // Remove trailing X
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim(); // Remove extra spaces

      // Use the original option number for matching and display
      const formattedContent = `${originalOptionNumber}. ${cleanContent}`;

      // Determine if correct, wrong, or neutral
      let isCorrect = el.classList.contains("rightAns");
      let isWrong = el.classList.contains("wrngAns");

      // Check if this is the user's chosen wrong answer
      let isChosenWrongAnswer =
        isWrong && chosenNum && originalOptionNumber === chosenNum;

      let bg = isCorrect
        ? "#f0fdf4" // Green for correct
        : isChosenWrongAnswer
        ? "#fef2f2" // Red for chosen wrong answer
        : "#f9fafb"; // Neutral for other wrong answers
      let border = isCorrect
        ? "2px solid #22c55e"
        : isChosenWrongAnswer
        ? "2px solid #ef4444"
        : "2px solid #e5e7eb";
      let color = isCorrect
        ? "#166534"
        : isChosenWrongAnswer
        ? "#7f1d1d"
        : "#374151";
      let fontWeight = isCorrect ? 600 : isChosenWrongAnswer ? 600 : 500;
      let icon = isCorrect ? "✓" : isChosenWrongAnswer ? "✗" : "";
      let iconColor = isCorrect
        ? "#22c55e"
        : isChosenWrongAnswer
        ? "#ef4444"
        : "#6b7280";

      el.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;width:auto;max-width:100%;background:${bg};border:${border};color:${color};padding:12px 16px;border-radius:12px;font-weight:${fontWeight};margin:8px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04);font-size:1rem;text-align:left;transition:all 0.3s ease;font-family:'Inter',sans-serif;word-wrap:break-word;overflow-wrap:break-word;">
        <span style="line-height:1.4;flex:1;min-width:0;">${formattedContent}</span>
        <span style="font-size:1.2rem;color:${iconColor};font-weight:bold;margin-left:12px;flex-shrink:0;">${icon}</span>
      </div>`;
    });
    // Remove old highlighting - we're using new styling now
    // const correctOptionCells = doc.querySelectorAll('td.rightAns');
    // correctOptionCells.forEach(cell => {
    //   // Remove old styling - new styling is handled above
    // });
    // Remove old chosen option highlighting - new styling handles this
    // if (chosenNum && ['1','2','3','4'].includes(chosenNum)) {
    //   // Find all option cells (wrong and right answers)
    //   const optionCells = doc.querySelectorAll('td.wrngAns, td.rightAns');
    //   optionCells.forEach(cell => {
    //     // Find the first number-dot pattern in the textContent
    //     const match = cell.textContent.match(/(\d+)\./);
    //     if (match && match[1] === chosenNum) {
    //       // Apply chosen option styling - this will override the correct/wrong styling
    //       const originalContent = cell.innerHTML;
    //       const cleanContent = originalContent.replace(/^\d+\.\s*/, '');
    //       cell.innerHTML = `<span style="display:inline-block;width:auto;background:linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);border:2px solid #e74c3c;color:#f3eaff;padding:8px 12px;border-radius:8px;font-weight:800;margin:4px 0;box-shadow:0 4px 12px rgba(231,76,60,0.3);">${cleanContent}</span>`;
    //     }
    //   });
    // }
    return doc.body.innerHTML;
  }

  async function handleInspect() {
    if (!url.trim()) {
      setError("Please paste a valid URL");
      return;
    }

    if (!isValidUrl(url.trim())) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setError("");
    setLoading(true);
    setStats(null);
    setDetailsHtml("");

    try {
      // POST to proxy with URL in body, omit cookies and referrer
      const res = await fetch(`${API_URL}/fetch-rrb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `Proxy fetch failed: ${res.status} - ${
            errorData.error || errorData.details || "Unknown error"
          }`
        );
      }

      const htmlText = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      // Extract candidate info from .main-info-pnl
      const infoPanel = doc.querySelector(".main-info-pnl");
      let infoHtml = "";
      let basicInfoHtml = "";
      let photosHtml = "";

      if (infoPanel) {
        // Fix image src if needed
        const imgs = infoPanel.querySelectorAll("img");
        imgs.forEach((img) => {
          const src = img.getAttribute("src");
          if (src && !src.startsWith("http") && !src.startsWith("data:")) {
            try {
              img.src = new URL(src, url.trim()).href;
            } catch (e) {}
          }
        });

        // Clone the panel for splitting
        const clonedPanel = infoPanel.cloneNode(true);

        // Extract basic info (text content) - remove photograph rows
        const basicInfoPanel = clonedPanel.cloneNode(true);
        const photoElements = basicInfoPanel.querySelectorAll("img");
        photoElements.forEach((img) => img.remove());

        // Remove photograph rows and note section from table
        const tableRows = basicInfoPanel.querySelectorAll("tr");
        tableRows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          cells.forEach((cell) => {
            const text = cell.textContent.trim().toLowerCase();
            if (
              text.includes("photograph") ||
              text.includes("photo") ||
              text.includes("note")
            ) {
              row.remove();
            }
          });
        });

        // Also remove any note sections from the HTML
        const noteElements = basicInfoPanel.querySelectorAll("*");
        noteElements.forEach((element) => {
          const text = element.textContent?.trim().toLowerCase() || "";
          if (
            text.includes("correct answer will carry") ||
            text.includes("incorrect answer will carry") ||
            text.includes("chosen option") ||
            text.includes("options shown in green")
          ) {
            element.remove();
          }
        });

        basicInfoHtml = basicInfoPanel.outerHTML;

        // Extract photos only
        const photosPanel = document.createElement("div");
        photosPanel.className = "main-info-pnl";
        const photoImgs = infoPanel.querySelectorAll("img");

        if (photoImgs.length > 0) {
          photoImgs.forEach((img) => {
            const imgClone = img.cloneNode(true);
            const imgContainer = document.createElement("div");
            imgContainer.style.cssText = "margin: 1rem 0; text-align: center;";
            imgContainer.appendChild(imgClone);
            photosPanel.appendChild(imgContainer);
          });
        } else {
          // Add "No photograph available" message with person icon
          const noPhotoDiv = document.createElement("div");
          noPhotoDiv.style.cssText = `
            text-align: center;
            padding: 3rem 2rem;
            color: #888;
            font-style: italic;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 2px dashed rgba(255, 255, 255, 0.2);
            margin: 1rem 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          `;
          noPhotoDiv.innerHTML = `
            <div style="
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: #666;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              border: none;
              position: relative;
            ">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
              </svg>
            </div>
            <div style="
              font-size: 1.1rem;
              color: #aaa;
              font-weight: 500;
              letter-spacing: 0.5px;
              margin-top: 0.5rem;
            ">No photograph available</div>
          `;
          photosPanel.appendChild(noPhotoDiv);
        }

        photosHtml = photosPanel.outerHTML;

        infoHtml = infoPanel.outerHTML;
      }

      setCandidateInfoHtml(infoHtml);
      setCandidateBasicInfo(basicInfoHtml);
      setCandidatePhotos(photosHtml);

      // Robust section mapping: iterate all elements in DOM order (not just direct children)
      let questionToSection = [];
      let currentSection = "Section";
      let detectedSections = [];
      const allElements = Array.from(doc.querySelectorAll("body *"));
      allElements.forEach((el) => {
        if (el.classList.contains("section-lbl")) {
          // Extract section name from the bold span
          const boldSpan = el.querySelector("span.bold");
          let sectionName = "Section";
          if (boldSpan) {
            sectionName = boldSpan.textContent.trim();
          } else {
            // Fallback: extract from text content, removing "Section :" prefix
            const fullText = el.textContent.trim();
            sectionName = fullText.replace(/^Section\s*:\s*/, "").trim();
          }
          currentSection = sectionName;
          detectedSections.push(sectionName);
        } else if (el.classList.contains("question-pnl")) {
          questionToSection.push(currentSection);
        }
      });
      // Debug: Log all detected section names
      console.log("Detected sections:", detectedSections);

      // Find all question panels - this is the exact structure from RRB response sheet
      const panels = Array.from(doc.querySelectorAll(".question-pnl"));

      // Calculate correct, wrong, unattempted
      let match = 0,
        wrong = 0,
        nil = 0;
      const questionDetailsArray = [];

      panels.forEach((panel, index) => {
        let chosen = "--";
        let correct = "N/A";
        let questionText = "";

        // Extract chosen option from the menu table
        const chosenRow = panel.querySelector('td[align="right"]');
        if (chosenRow && chosenRow.textContent.includes("Chosen Option")) {
          const nextTd = chosenRow.nextElementSibling;
          if (nextTd && nextTd.classList.contains("bold")) {
            chosen = nextTd.textContent.trim();
          }
        }

        // Alternative method: search for the exact pattern
        if (chosen === "--") {
          const allTds = panel.querySelectorAll("td");
          for (let i = 0; i < allTds.length - 1; i++) {
            const td = allTds[i];
            if (
              td.textContent.includes("Chosen Option") &&
              td.getAttribute("align") === "right"
            ) {
              const nextTd = allTds[i + 1];
              if (nextTd && nextTd.classList.contains("bold")) {
                chosen = nextTd.textContent.trim();
                break;
              }
            }
          }
        }

        // Extract correct answer - look for elements with class "rightAns"
        const rightAnsElements = panel.querySelectorAll(".rightAns");
        if (rightAnsElements.length > 0) {
          // Get the text content and extract the option number
          const rightAnsText = rightAnsElements[0].textContent.trim();
          // Extract the option number (1, 2, 3, or 4) from the text
          const optionMatch = rightAnsText.match(/^(\d+)\./);
          if (optionMatch) {
            correct = optionMatch[1];
          } else {
            // If no number found, try to extract from the beginning
            const firstChar = rightAnsText.charAt(0);
            if (["1", "2", "3", "4"].includes(firstChar)) {
              correct = firstChar;
            }
          }
        }

        // Extract question text for debugging
        const questionEl = panel.querySelector(".qstn-body, .question, h3, h4");
        if (questionEl) {
          questionText = questionEl.textContent || questionEl.innerText || "";
        }

        questionDetailsArray.push({
          index: index + 1,
          chosen,
          correct,
          questionText: questionText.substring(0, 50) + "...",
          section: questionToSection[index] || "Section",
        });

        if (chosen === "--") nil++;
        else if (chosen === correct) match++;
        else wrong++;
      });
      // Debug: Log each question's mapping
      questionDetailsArray.forEach((q, index) => {
        console.log(
          `Q${index + 1}: Section = ${q.section}, Chosen = ${
            q.chosen
          }, Correct = ${q.correct}, Text = ${q.questionText}`
        );
      });

      if (panels.length === 0) {
        throw new Error(
          "No questions found—check your URL or sheet format. Try a different RRB response sheet URL."
        );
      }

      // Determine marking scheme
      let correctMark = 1,
        wrongMark = -1 / 3;
      if (selectedExam === "phase13") {
        correctMark = 2;
        wrongMark = -0.5;
      } else if (selectedExam === "cgl") {
        correctMark = 2;
        wrongMark = -0.25;
      } else if (selectedExam === "ntpc") {
        correctMark = 3;
        wrongMark = -1;
      } else if (selectedExam === "chsl") {
        correctMark = 2;
        wrongMark = -0.5;
      } else if (selectedExam === "others") {
        correctMark = parseFloat(customMarks.correct) || 0;
        wrongMark = parseFloat(customMarks.wrong) || 0;
      }

      // Restore calculation for total and marks after removing highlight code
      const total = panels.length;
      const marks = match * correctMark + wrong * wrongMark;

      // Build sectioned wrong/unattempted questions
      // Remove all code that references or uses 'sections', 'sectionedWrong', and 'sectionedUnattempted'.
      // (No code for these variables should remain.)
      setSectionedDetails({ wrong: [], unattempted: [] });
      setQuestionDetails(questionDetailsArray);

      // Build "differences" HTML for any non‑matched questions with color coding
      const wrongQuestions = panels
        .filter((panel, index) => {
          const detail = questionDetailsArray[index];
          const isWrong =
            detail &&
            detail.chosen !== detail.correct &&
            detail.chosen !== "--";
          return isWrong;
        })
        .map((panel, index) => {
          // Extract question text from the original panel BEFORE processing
          const questionText = extractQuestionTextFromPanel(panel);
          console.log(`Wrong question ${index + 1} text:`, questionText); // Debug log
          console.log(
            `Wrong question ${index + 1} HTML:`,
            panel.outerHTML.substring(0, 500)
          ); // Debug HTML
          const questionId = `wrong-${index}`;
          // Show the full original HTML of the question panel, fixing image src and highlighting rightAns
          return `<div style='background:#f6fff9;border:1.5px solid #b6f7c1;border-radius:12px;padding:1.2rem 1.5rem;margin-bottom:1.5rem;box-shadow:0 2px 8px rgba(40,167,69,0.06);display:flex;flex-direction:column;align-items:flex-start;position:relative;' class="mobile-question-card">
            <button 
              onclick="window.copyQuestionText('${questionId}', \`${questionText
            .replace(/`/g, "\\`")
            .replace(/\$/g, "\\$")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")}\`)"
              id="${questionId}"
              style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                padding: 10px 18px;
                font-size: 0.95rem;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                z-index: 100;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Inter', sans-serif;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                min-width: 140px;
                justify-content: center;
              "
              class="mobile-copy-button mobile-button"
              onmouseover="this.style.transform='scale(1.08)';this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.5)';this.style.border='2px solid rgba(255, 255, 255, 0.5)'"
              onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)';this.style.border='2px solid rgba(255, 255, 255, 0.3)'"
            >
              📋 Copy Question
            </button>
            ${fixImageSrcAndHighlight(panel.outerHTML, url.trim())}
          </div>`;
        })
        .join("");

      const unattemptedQuestions = panels
        .filter((panel, index) => {
          const detail = questionDetailsArray[index];
          const isUnattempted = detail && detail.chosen === "--";
          return isUnattempted;
        })
        .map((panel, index) => {
          // Extract question text from the original panel BEFORE processing
          const questionText = extractQuestionTextFromPanel(panel);
          console.log(`Unattempted question ${index + 1} text:`, questionText); // Debug log
          console.log(
            `Unattempted question ${index + 1} HTML:`,
            panel.outerHTML.substring(0, 500)
          ); // Debug HTML
          const questionId = `unattempted-${index}`;
          // Show the full original HTML of the question panel, fixing image src and highlighting rightAns
          return `<div style='background:#f6fff9;border:1.5px solid #b6f7c1;border-radius:12px;padding:1.2rem 1.5rem;margin-bottom:1.5rem;box-shadow:0 2px 8px rgba(40,167,69,0.06);display:flex;flex-direction:column;align-items:flex-start;position:relative;' class="mobile-question-card">
            <button 
              onclick="window.copyQuestionText('${questionId}', \`${questionText
            .replace(/`/g, "\\`")
            .replace(/\$/g, "\\$")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")}\`)"
              id="${questionId}"
              style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                padding: 10px 18px;
                font-size: 0.95rem;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                z-index: 100;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Inter', sans-serif;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                min-width: 140px;
                justify-content: center;
              "
              class="mobile-copy-button mobile-button"
              onmouseover="this.style.transform='scale(1.08)';this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.5)';this.style.border='2px solid rgba(255, 255, 255, 0.5)'"
              onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)';this.style.border='2px solid rgba(255, 255, 255, 0.3)'"
            >
              📋 Copy Question
            </button>
            ${fixImageSrcAndHighlight(panel.outerHTML, url.trim())}
          </div>`;
        })
        .join("");

      setStats({ total, match, wrong, nil, marks: marks.toFixed(2) });
      setDetailsHtml({ wrongQuestions, unattemptedQuestions });
    } catch (e) {
      setError(e.message);
      console.error("Error details:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        padding: "1rem",
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <AnimatedBackground />

      <style>{`
        /* Responsive Design */
        @media (max-width: 768px) {
          .mobile-padding {
            padding: 0.5rem !important;
          }
          
          .mobile-text {
            font-size: 0.9rem !important;
          }
          
          .mobile-button {
            padding: 8px 12px !important;
            font-size: 0.8rem !important;
            min-width: 120px !important;
          }
          
          .mobile-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 0.5rem !important;
          }
          
          .mobile-question-card {
            padding: 1rem !important;
            margin-bottom: 1rem !important;
            border-radius: 12px !important;
          }
          
          .mobile-copy-button {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            margin: 0.5rem 0 !important;
            width: 100% !important;
            justify-content: center !important;
          }
          
          .mobile-table {
            font-size: 0.8rem !important;
            overflow-x: auto !important;
          }
          
          .mobile-table th,
          .mobile-table td {
            padding: 0.5rem 0.25rem !important;
            white-space: nowrap !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-padding {
            padding: 0.25rem !important;
          }
          
          .mobile-text {
            font-size: 0.8rem !important;
          }
          
          .mobile-button {
            padding: 6px 10px !important;
            font-size: 0.75rem !important;
            min-width: 100px !important;
          }
          
          .mobile-container {
            padding: 0 0.25rem !important;
          }
          
          .mobile-question-card {
            padding: 0.75rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          /* Reduce animated background elements on mobile */
          .animated-bg-element {
            display: none !important;
          }
          
          /* Show only essential background elements */
          .animated-bg-element:nth-child(1),
          .animated-bg-element:nth-child(2) {
            display: block !important;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.3); }
          50% { box-shadow: 0 0 40px rgba(78, 205, 196, 0.6); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(10px) translateY(-5px); }
          50% { transform: translateX(0) translateY(-10px); }
          75% { transform: translateX(-10px) translateY(-5px); }
        }
        
        @keyframes morph {
          0%, 100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
          25% { border-radius: 50% 50% 50% 50% / 30% 70% 70% 30%; }
          50% { border-radius: 50% 50% 50% 50% / 70% 30% 30% 70%; }
          75% { border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%; }
        }
        
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
      `}</style>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          zIndex: 10,
        }}
        className="mobile-container"
      >
        <Header />
        <div className="top-bar-row">
          <SearchBar
            url={url}
            setUrl={setUrl}
            loading={loading}
            handleInspect={handleInspect}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
          />
          <ExamSelector
            selectedExam={selectedExam}
            setSelectedExam={setSelectedExam}
            customMarks={customMarks}
            setCustomMarks={setCustomMarks}
          />
        </div>
        {error && <ErrorMessage error={error} />}
        {candidateBasicInfo && (
          <CandidateProfile
            candidateInfoHtml={candidateInfoHtml}
            candidateBasicInfo={candidateBasicInfo}
            candidatePhotos={candidatePhotos}
          />
        )}
        {questionDetails.length > 0 && (
          <SectionAnalysisTable
            questionDetails={questionDetails}
            selectedExam={selectedExam}
            customMarks={customMarks}
          />
        )}
        <QuestionList
          sectionedDetails={sectionedDetails}
          detailsHtml={detailsHtml}
          openSections={openSections}
          toggleSection={toggleSection}
          stats={stats}
        />
      </div>
    </div>
  );
}

export default App;
