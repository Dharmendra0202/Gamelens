import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── India Cities Dataset ───────────────────────────────────────────────────────
// Top 150+ cities/towns. Future-ready for API replacement.
const CITIES: string[] = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Allahabad",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Chandigarh",
  "Guwahati",
  "Solapur",
  "Hubli-Dharwad",
  "Mysore",
  "Tiruchirappalli",
  "Bareilly",
  "Aligarh",
  "Tiruppur",
  "Moradabad",
  "Jalandhar",
  "Bhubaneswar",
  "Salem",
  "Warangal",
  "Guntur",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Bikaner",
  "Amravati",
  "Noida",
  "Jamshedpur",
  "Bhilai",
  "Cuttack",
  "Firozabad",
  "Kochi",
  "Nellore",
  "Bhavnagar",
  "Dehradun",
  "Durgapur",
  "Asansol",
  "Rourkela",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Akola",
  "Gulbarga",
  "Jamnagar",
  "Ujjain",
  "Loni",
  "Siliguri",
  "Jhansi",
  "Ulhasnagar",
  "Jammu",
  "Sangli",
  "Mangalore",
  "Erode",
  "Belgaum",
  "Ambattur",
  "Tirunelveli",
  "Malegaon",
  "Gaya",
  "Jalgaon",
  "Udaipur",
  "Maheshtala",
  "Davanagere",
  "Kozhikode",
  "Kurnool",
  "Bokaro",
  "South Dumdum",
  "Bellary",
  "Patiala",
  "Gopalpur",
  "Agartala",
  "Bhagalpur",
  "Muzaffarnagar",
  "Bhatpara",
  "Panihati",
  "Latur",
  "Dhule",
  "Rohtak",
  "Korba",
  "Bhilwara",
  "Berhampur",
  "Muzaffarpur",
  "Ahmednagar",
  "Mathura",
  "Kollam",
  "Avadi",
  "Kadapa",
  "Kamarhati",
  "Sambalpur",
  "Bilaspur",
  "Shahjahanpur",
  "Satara",
  "Bijapur",
  "Rampur",
  "Shimoga",
  "Chandrapur",
  "Junagadh",
  "Thrissur",
  "Alwar",
  "Bardhaman",
  "Kulti",
  "Kakinada",
  "Nizamabad",
  "Parbhani",
  "Tumkur",
  "Khammam",
  "Ozhukarai",
  "Bihar Sharif",
  "Panipat",
  "Darbhanga",
  "Bally",
  "Aizawl",
  "Dewas",
  "Ichalkaranji",
  "Karnal",
  "Bathinda",
  "Jalna",
  "Eluru",
  "Barasat",
  "Kirari Suleman Nagar",
  "Purnia",
  "Satna",
  "Mau",
  "Sonipat",
  "Farrukhabad",
  "Durg",
  "Imphal",
  "Ratlam",
  "Hapur",
  "Arrah",
  "Anantapur",
  "Karimnagar",
  "Etawah",
  "Ambarnath",
  "Bharatpur",
  "Begusarai",
  "New Delhi",
  "Gandhidham",
  "Baranagar",
  "Tiruvottiyur",
  "Pondicherry",
  "Sikar",
  "Thoothukudi",
  "Rewa",
  "Mirzapur",
  "Raichur",
  "Pali",
  "Ramagundam",
  "Haridwar",
  "Vijayanagaram",
  "Tenali",
  "Proddatur",
  "Nagercoil",
  "Thanjavur",
  "Bhayander",
  "Borivali",
  "Andheri",
  "Bandra",
  "Malad",
  "Goregaon",
  "Vashi",
  "Kharghar",
  "Panvel",
  "Kalyan",
  "Dombivli",
  "Mira Road",
  "Vasai",
  "Virar",
  "Airoli",
  "Turbhe",
  "Nerul",
  "Belapur",
];

interface CitySearchDropdownProps {
  value: string;
  onSelect: (city: string) => void;
  placeholder?: string;
}

export function CitySearchDropdown({
  value,
  onSelect,
  placeholder = "e.g. Mumbai",
}: CitySearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return CITIES.slice(0, 50); // Show top 50 by default
    const term = search.toLowerCase().trim();
    return CITIES.filter((c) => c.toLowerCase().includes(term)).slice(0, 50);
  }, [search]);

  const handleSelect = useCallback(
    (city: string) => {
      onSelect(city);
      setOpen(false);
      setSearch("");
    },
    [onSelect],
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, value.trim() && styles.triggerDone]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="location-outline"
          size={18}
          color={value.trim() ? "#B71C1C" : "#9E9E9E"}
        />
        <Text
          style={[
            styles.triggerText,
            !value.trim() && styles.triggerPlaceholder,
          ]}
        >
          {value.trim() || placeholder}
        </Text>
        {value.trim() ? (
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
        ) : (
          <Ionicons name="chevron-down" size={18} color="#9E9E9E" />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Select City / Town</Text>

            {/* Search */}
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color="#9E9E9E" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search city..."
                placeholderTextColor="#9E9E9E"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={18} color="#9E9E9E" />
                </TouchableOpacity>
              )}
            </View>

            {/* City List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      selected && styles.cityItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Ionicons
                      name="location"
                      size={16}
                      color={selected ? "#B71C1C" : "#9E9E9E"}
                    />
                    <Text
                      style={[
                        styles.cityText,
                        selected && styles.cityTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={18} color="#B71C1C" />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No cities found for "{search}"
                </Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  triggerDone: {
    borderColor: "#B71C1C",
    backgroundColor: "#FBE9E7",
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  triggerPlaceholder: {
    color: "#9E9E9E",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#212121",
    marginBottom: 12,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#212121",
    fontWeight: "500",
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
  },
  cityItemSelected: {
    backgroundColor: "#FBE9E7",
  },
  cityText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  cityTextSelected: {
    color: "#B71C1C",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#9E9E9E",
    paddingVertical: 24,
  },
});
