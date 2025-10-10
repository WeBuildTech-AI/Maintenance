// src/utils/filterDataFetcher.ts
import { locationService } from "../../store/locations/locations.service";
import { partService } from "../../store/parts/parts.service";
import { assetService } from "../../store/assets/assets.service";
import { vendorService } from "../../store/vendors/vendors.service";
import { procedureService } from "../../store/procedures/procedures.service";
import { teamMemberService } from "../../store/teamMembers/teamMembers.service";

// 🔹 Simple in-memory cache to avoid repeat API calls
const cache: Record<string, any[]> = {};

/**
 * Universal filter data fetcher.
 * Handles: Locations, Assets, Parts, Vendors, Procedures, Team Members
 */
export async function fetchFilterData(filterType: string) {
  const key = filterType.toLowerCase();

  // ✅ Return cached data instantly if available
  if (cache[key]) {
    console.log(`🟡 Cache hit for ${key}`, cache[key]);
    return { data: cache[key], fromCache: true };
  }

  try {
    let result: any[] = [];

    switch (key) {
      /**
       * -------------------------------------------------
       * 🏢 LOCATIONS
       * -------------------------------------------------
       */
      case "location":
      case "locations": {
        const res = await locationService.fetchLocationsName(1000, 1, 0);
        const list = Array.isArray(res?.data) ? res.data : res;
        result = (list || []).map((l: any) => ({
          id: l.id,
          name: l.name,
          image: l.image || null,
        }));
        console.log("🟢 Locations fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * ⚙️ PARTS
       * -------------------------------------------------
       */
      case "part":
      case "parts": {
        const res = await partService.fetchPartsName();
        const list = Array.isArray(res?.data) ? res.data : res;
        result = (list || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          image: p.image || null,
        }));
        console.log("🟢 Parts fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * 🧱 ASSETS
       * -------------------------------------------------
       */
      case "asset":
      case "assets": {
        const res = await assetService.fetchAssetsName();
        const list = Array.isArray(res?.data) ? res.data : res;
        result = (list || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          image: a.image || null,
        }));
        console.log("🟢 Assets fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * 🧑‍🔧 VENDORS
       * -------------------------------------------------
       */
      case "vendor":
      case "vendors": {
        const res = await vendorService.fetchVendorName();
        const list = Array.isArray(res?.data) ? res.data : res;
        result = (list || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          image: v.image || null,
        }));
        console.log("🟢 Vendors fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * 📋 PROCEDURES
       * -------------------------------------------------
       */
      case "procedure":
      case "procedures": {
        const res = await procedureService.fetchProcedures();
        const list = Array.isArray(res?.data) ? res.data : res;
        result = (list || []).map((proc: any) => ({
          id: proc.id,
          name: proc.name || proc.procedureName || "Unnamed Procedure",
          image: null,
        }));
        console.log("🟢 Procedures fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * 👥 TEAM MEMBERS
       * -------------------------------------------------
       */
      case "team":
      case "teammember":
      case "teammembers":
      case "team-members":
      case "team member":
      case "team members": {
        const res = await teamMemberService.fetchTeamMembers();
        const list = Array.isArray(res?.data) ? res.data : res;
        result = (list || []).map((t: any) => ({
          id: t.id,
          name:
            t.name ||
            `${t.firstName || ""} ${t.lastName || ""}`.trim() ||
            "Unnamed Member",
          image: t.avatar || t.image || null,
        }));
        console.log("🟢 Team Members fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * ❌ UNKNOWN TYPE
       * -------------------------------------------------
       */
      default:
        console.warn(`⚠️ Unknown filter type: "${filterType}"`);
        result = [];
    }

    // ✅ Cache the result for reuse
    cache[key] = result;
    return { data: result, fromCache: false };
  } catch (error) {
    console.error(`❌ Error fetching ${filterType} data:`, error);
    return { data: [], fromCache: false, error };
  }
}
