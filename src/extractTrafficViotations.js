import * as cheerio from "cheerio";

/**
 * Extracts traffic violation records from HTML
 * @param {string} html - The HTML content containing traffic violation records
 * @returns {Array} - Array of traffic violation record objects
 */
export function extractTrafficViolations(html) {
  const $ = cheerio.load(html);
  const violations = [];
  let currentViolation = {};
  let ContactAddress = [];

  // Find all form-group divs
  $(".form-group").each((index, element) => {
    // Check if this is a horizontal form-group with a label and value
    const label = $(element).find("label span").text().trim();
    const value = $(element).find(".col-md-9").text().trim();

    // If we find an hr tag, it means we're starting a new record
    if ($(element).next().is("hr") || $(element).prev().is("hr")) {
      if (Object.keys(currentViolation).length > 0) {
        // Add resolution places to the current violation before pushing
        currentViolation.ContactAddress = ContactAddress;
        violations.push(currentViolation);
        currentViolation = {};
        ContactAddress = [];
      }
    }

    // Process fields with label-value pairs
    if (label && value) {
      switch (label) {
        case "Biển kiểm soát:":
          currentViolation.LicenseNumber = value;
          break;
        case "Màu biển:":
          currentViolation.Specs = value;
          break;
        case "Loại phương tiện:":
          currentViolation.VehicleType = value;
          break;
        case "Thời gian vi phạm:":
          currentViolation.ViolationTime_DateTime = value;
          break;
        case "Địa điểm vi phạm:":
          currentViolation.ViolationAddress = value;
          break;
        case "Hành vi vi phạm:":
          currentViolation.Behavior = value;
          break;
        case "Trạng thái:":
          currentViolation.Status = value;
          break;
        case "Đơn vị phát hiện vi phạm:":
          currentViolation.Provider = value;
          break;
      }
    }

    // Process resolution places
    const text = $(element).text().trim();
    if (text.startsWith("1.") || text.startsWith("2.")) {
      // This is a resolution place
      ContactAddress.push({
        Name: text,
      });
    } else if (text.startsWith("Địa chỉ:")) {
      // This is an address for the previous resolution place
      if (ContactAddress.length > 0) {
        ContactAddress[ContactAddress.length - 1].Address = text
          .replace("Địa chỉ:", "")
          .trim();
      }
    } else if (text.toLowerCase().startsWith("số điện thoại liên hệ:")) {
      // Đây là số điện thoại liên hệ
      const phone = text.replace(/số điện thoại liên hệ:/i, "").trim();
      if (ContactAddress.length > 0) {
        ContactAddress[ContactAddress.length - 1].Phone = phone;
      } else {
        // Nếu chưa có ContactAddress nào, tạo mới
        ContactAddress.push({
          Phone: phone,
        });
      }
    }
  });

  // Add the last violation if it exists
  if (Object.keys(currentViolation).length > 0) {
    currentViolation.ContactAddress = ContactAddress;
    violations.push(currentViolation);
  }

  return violations;
}
