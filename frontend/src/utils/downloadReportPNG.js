// import html2canvas from "html2canvas";

// export async function downloadStudentStylePNG(divId, studentName, month) {
//   const element = document.getElementById(divId);
//   if (!element) return alert("Report container not found.");

//   const prev = element.style.display;
//   element.style.display = "block";

//   const canvas = await html2canvas(element, { scale: 2 });
//   const link = document.createElement("a");
//   link.download = `${studentName}_${month}.png`.replace(/\s+/g, "_");
//   link.href = canvas.toDataURL();
//   link.click();

//   element.style.display = prev;
// }


import html2canvas from "html2canvas";

export async function downloadStudentStylePNG(divId, studentName, month) {
  const element = document.getElementById(divId);
  if (!element) return alert("Report container not found.");

  const prevDisplay = element.style.display;
  element.style.display = "block";

  window.scrollTo(0, 0);
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.download = `${studentName}_${month}.png`.replace(/\s+/g, "_");
  link.href = canvas.toDataURL("image/png");
  link.click();

  element.style.display = prevDisplay;
}
