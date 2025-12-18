// src/utils/filterDataFetcher.ts
import { locationService } from "../../store/locations/locations.service";
import { partService } from "../../store/parts/parts.service";
import { assetService } from "../../store/assets/assets.service";
import { vendorService } from "../../store/vendors/vendors.service";
import { procedureService } from "../../store/procedures/procedures.service";
import { userService } from "../../store/users/users.service";
import { categoryService } from "../../store/categories/categories.service";
import { teamService } from "../../store/teams/teams.service";
import { meterService } from "../../store/meters/meters.service";

// 🔹 Simple in-memory cache to avoid repeat API calls
const cache: Record<string, any[]> = {};

/**
 * Universal filter data fetcher.
 * Handles: Locations, Assets, Parts, Vendors, Procedures, Team Members, Users, Categories, Meters
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
    let list: any[] = []; // To hold the response data array

    switch (key) {
      /**
       * -------------------------------------------------
       * 🏢 LOCATIONS
       * -------------------------------------------------
       */
      case "location":
      case "locations": {
        const res = await locationService.fetchLocationsName(1000, 1, 0);
        list = Array.isArray(res?.data) ? res.data : res;
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
        list = Array.isArray(res?.data) ? res.data : res;
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
        list = Array.isArray(res?.data) ? res.data : res;
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
        list = Array.isArray(res?.data) ? res.data : res;
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
       * 🏷️ CATEGORIES
       * -------------------------------------------------
       */
      case "category":
      case "categories": {
        list = await categoryService.fetchCategories();
        result = (list || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          image: null, 
        }));
        console.log("🟢 Categories fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * 👤 USERS (summary)
       * -------------------------------------------------
       */
      case "user":
      case "users": {
        list = await userService.fetchUserSummary();
        result = (list || []).map((u: any) => ({
          id: u.id,
          name: u.fullName || "Unnamed User",
          image: null,
        }));
        console.log("🟢 Users fetched (summary):", result.length);
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
        list = Array.isArray(res?.data) ? res.data : res;
        result = (list || []).map((proc: any) => ({
          id: proc.id,
          name: proc.name || proc.procedureName || proc.title || "Unnamed Procedure",
          image: null,
        }));
        console.log("🟢 Procedures fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * 👥 TEAMS
       * -------------------------------------------------
       */
      case "team":
      case "teams": // ✅ ADDED THIS CASE (This was missing!)
      case "teams in charge": // ✅ ADDED Safety alias
      case "teammember":
      case "teammembers":
      case "team-members":
      case "team member":
      case "team members": {
        list = await teamService.fetchTeamsName();
        result = (list || []).map((t: any) => ({
          id: t.id,
          name: t.name || "Unnamed Team",
          image: null,
        }));
        console.log("🟢 Teams fetched:", result.length);
        break;
      }

      /**
       * -------------------------------------------------
       * 📟 METERS
       * -------------------------------------------------
       */
      case "meter":
      case "meters": {
        list = await meterService.fetchMeters(1000, 1, 0);
        result = (list || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          image: null, 
        }));
        console.log("🟢 Meters fetched:", result.length);
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