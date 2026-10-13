
import Hospital from "../models/hospital.models.js";

const normalizeOwnership = (value) => {
  const ownership = String(value || "").trim().toLowerCase();

  if (
    [
      "government",
      "govt",
      "public",
      "state government",
      "central government",
      "local government",
    ].includes(ownership)
  ) {
    return "government";
  }

  if (
    ["private", "privately owned", "private hospital"].includes(ownership)
  ) {
    return "private";
  }

  return null;
};

const cleanValue = (value) => {
  if (value === undefined || value === null) return "";

  const cleaned = String(value).trim();

  // The API uses "0" to represent missing values in many fields.
  return cleaned === "0" ? "" : cleaned;
};

export const importHospitals = async (req, res) => {
  try {
    const configuredUrl = process.env.HOSPITAL_DATA_API_URL;
    const apiKey = process.env.HOSPITAL_DATA_API_KEY;

    if (!configuredUrl || !apiKey) {
      return res.status(503).json({
        success: false,
        message: "Hospital API URL or API key is not configured.",
      });
    }

    const apiUrl = new URL(configuredUrl);
    apiUrl.searchParams.set("api-key", apiKey);
    apiUrl.searchParams.set("format", "json");
    apiUrl.searchParams.set("limit", "100");
    apiUrl.searchParams.set("offset", "0");

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("Hospital provider HTTP status:", response.status);

      return res.status(502).json({
        success: false,
        message: `Hospital data provider returned HTTP ${response.status}.`,
      });
    }

    const data = await response.json();

    if (!Array.isArray(data.records)) {
      return res.status(502).json({
        success: false,
        message: "The provider response does not contain a records array.",
      });
    }

    const records = data.records;

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    console.log("Records to process:", records.length);

    for (const record of records) {
      try {
        const name = cleanValue(
          record.hospital_name || record.name || record.Hospital_Name
        );

        const address = cleanValue(
          record._address_original_first_line ||
          record.Address ||
          record.address ||
          record._location ||
          record.location
        );

        const city = cleanValue(
          record.district || record.District || record.city
        );

        const state = cleanValue(record.state || record.State);

        const pinCode = cleanValue(
          record._pincode ||
          record.PINCODE ||
          record.Pincode ||
          record.pincode
        );

        const phone = cleanValue(
          record.telephone ||
          record.Contact_Number ||
          record.contact_number ||
          record.phone
        );

        const email = cleanValue(
          record._hospital_primary_email_id ||
          record.email ||
          record.Email
        );

        const ownership = normalizeOwnership(
          record.ownership ||
          record.ownership_type ||
          record.management ||
          record.hospitalType
        );

        // The API doesn't reliably provide ownership, so do not guess it.
        const hospitalType = ownership || "unknown";

        if (!name || !address || !city || !state) {
          skipped++;
          console.log("Skipped incomplete record:", name || "(no name)");
          continue;
        }

        // Avoid importing the same hospital more than once.
        const existing = await Hospital.findOne({
          name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
          city,
          state,
        });

        if (existing) {
          skipped++;
          continue;
        }

        const hospitalData = {
          name,
          address,
          city,
          state,
          hospitalType,
        };

        if (pinCode) hospitalData.pinCode = pinCode;
        if (phone) hospitalData.phone = phone;
        if (email) hospitalData.email = email;

        await Hospital.create(hospitalData);

        imported++;
      //  console.log("Imported hospital:", name);
      } catch (recordError) {
        failed++;
        console.error(
          "Failed to import hospital:",
          record.hospital_name || "(unknown name)",
          recordError.message
        );
      }
    }

    /*console.log("Hospital import summary:", {
      totalReceived: records.length,
      imported,
      skipped,
      failed,
    });*/

    return res.status(200).json({
      success: true,
      message: "Hospital import completed.",
      imported,
      skipped,
      failed,
      totalReceived: records.length,
    });
  } catch (error) {
    console.error("Hospital import failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Hospital import failed. Check the backend logs.",
    });
  }
};
