import { EmptyState } from "@/components/EmptyState";
import { AnimatedViewTransition } from "@/components/ui/animated-view-transition";
import { SectionHeader } from "@/components/ui/section-header";
import { TabScreenWrapper } from "@/components/ui/tab-screen-wrapper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Product = {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  category: string;
  rating: number;
};

type FeaturedDeal = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  color: string;
};

export default function StoreScreen() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);

  // Category filters are UI labels, not data — kept as-is.
  const categories = [
    { id: "all", name: "All", icon: "grid-outline" },
    { id: "bats", name: "Bats", icon: "baseball-outline" },
    { id: "balls", name: "Balls", icon: "basketball-outline" },
    { id: "gear", name: "Gear", icon: "shield-outline" },
    { id: "apparel", name: "Apparel", icon: "shirt-outline" },
  ];

  // TODO(backend): fetch products from store API / Supabase 'products' table
  const products: Product[] = [];

  // TODO(backend): fetch featured deals from store API / Supabase 'deals' table
  const featuredDeals: FeaturedDeal[] = [];

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>
            GAME<Text style={styles.headerTitleOrange}>LENS STORE</Text>
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
              <Ionicons name="cart-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Featured Deals */}
          {featuredDeals.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader
                title="Featured Deals"
                style={{ paddingHorizontal: 0 }}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredDeals.map((deal) => (
                  <TouchableOpacity key={deal.id} style={styles.dealCard}>
                    <ImageBackground
                      source={{ uri: deal.image }}
                      style={styles.dealImage}
                      imageStyle={styles.dealImageStyle}
                    >
                      <View style={styles.dealOverlay}>
                        <Text style={styles.dealTitle}>{deal.title}</Text>
                        <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
                        <TouchableOpacity style={styles.dealButton}>
                          <Text style={styles.dealButtonText}>Shop Now</Text>
                        </TouchableOpacity>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    activeCategory === category.id && styles.activeCategoryChip,
                  ]}
                  onPress={() => setActiveCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={activeCategory === category.id ? "#FFF" : "#B91C1C"}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      activeCategory === category.id &&
                        styles.activeCategoryChipText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Products Grid */}
          <View style={styles.section}>
            <SectionHeader
              title="All Products"
              right={
                <TouchableOpacity>
                  <Ionicons name="options-outline" size={24} color="#B91C1C" />
                </TouchableOpacity>
              }
              style={{ paddingHorizontal: 0 }}
            />

            <AnimatedViewTransition
              transitionKey={activeCategory}
              type="slideUp"
            >
              {products.length === 0 ? (
                <EmptyState
                  icon="🛒"
                  title="No products yet"
                  subtitle="The store is being stocked. Check back soon for cricket gear, apparel and more."
                />
              ) : (
                <View style={styles.productsGrid}>
                  {products
                    .filter(
                      (p) =>
                        activeCategory === "all" ||
                        p.category === activeCategory,
                    )
                    .map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.productCard}
                      >
                        <ImageBackground
                          source={{ uri: product.image }}
                          style={styles.productImage}
                          imageStyle={styles.productImageStyle}
                        >
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              {product.discount}
                            </Text>
                          </View>
                          <TouchableOpacity style={styles.wishlistButton}>
                            <Ionicons
                              name="heart-outline"
                              size={20}
                              color="#FFF"
                            />
                          </TouchableOpacity>
                        </ImageBackground>

                        <View style={styles.productInfo}>
                          <Text style={styles.productName} numberOfLines={2}>
                            {product.name}
                          </Text>
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#B91C1C" />
                            <Text style={styles.ratingText}>
                              {product.rating}
                            </Text>
                          </View>
                          <View style={styles.priceContainer}>
                            <Text style={styles.productPrice}>
                              {product.price}
                            </Text>
                            <Text style={styles.originalPrice}>
                              {product.originalPrice}
                            </Text>
                          </View>
                          <TouchableOpacity style={styles.addToCartButton}>
                            <Ionicons name="cart" size={16} color="#FFF" />
                            <Text style={styles.addToCartText}>
                              Add to Cart
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </AnimatedViewTransition>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF2F2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerTitleOrange: {
    color: "#FCA5A5",
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  content: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  section: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 8,
  },

  dealCard: {
    width: 300,
    height: 150,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealImageStyle: {
    borderRadius: 12,
  },
  dealOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 20,
    justifyContent: "center",
  },
  dealTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  dealSubtitle: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 12,
  },
  dealButton: {
    backgroundColor: "#FCA5A5",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  dealButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  categoriesSection: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingLeft: 16,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    marginRight: 12,
    gap: 6,
  },
  activeCategoryChip: {
    backgroundColor: "#B91C1C",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B91C1C",
  },
  activeCategoryChipText: {
    color: "#FFF",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  productImage: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  productImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    height: 36,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B91C1C",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    flexDirection: "row",
    backgroundColor: "#B91C1C",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
});
