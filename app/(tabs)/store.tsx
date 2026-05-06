import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function StoreScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartCount, setCartCount] = useState(3);

  const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'bats', name: 'Bats', icon: 'baseball-outline' },
    { id: 'balls', name: 'Balls', icon: 'basketball-outline' },
    { id: 'gear', name: 'Gear', icon: 'shield-outline' },
    { id: 'apparel', name: 'Apparel', icon: 'shirt-outline' },
  ];

  const products = [
    { id: 1, name: 'India Jersey 2024', price: '₹2,499', originalPrice: '₹3,499', discount: '29%', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', category: 'apparel', rating: 4.5 },
    { id: 2, name: 'Leather Cricket Ball', price: '₹599', originalPrice: '₹799', discount: '25%', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&h=400&fit=crop', category: 'balls', rating: 4.8 },
    { id: 3, name: 'Professional Cricket Bat', price: '₹3,999', originalPrice: '₹5,999', discount: '33%', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=400&fit=crop', category: 'bats', rating: 4.7 },
    { id: 4, name: 'Batting Gloves Pro', price: '₹1,299', originalPrice: '₹1,799', discount: '28%', image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=400&h=400&fit=crop', category: 'gear', rating: 4.6 },
    { id: 5, name: 'Cricket Helmet', price: '₹2,199', originalPrice: '₹2,999', discount: '27%', image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=400&fit=crop', category: 'gear', rating: 4.9 },
    { id: 6, name: 'Cricket Shoes', price: '₹2,999', originalPrice: '₹4,499', discount: '33%', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', category: 'apparel', rating: 4.4 },
    { id: 7, name: 'Wicket Keeping Gloves', price: '₹1,799', originalPrice: '₹2,499', discount: '28%', image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=400&h=400&fit=crop', category: 'gear', rating: 4.5 },
    { id: 8, name: 'Practice Cricket Ball Set', price: '₹899', originalPrice: '₹1,299', discount: '31%', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&h=400&fit=crop', category: 'balls', rating: 4.3 },
  ];

  const featuredDeals = [
    { id: 1, title: 'Summer Sale', subtitle: 'Up to 50% OFF', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=400&fit=crop', color: '#FF6B8A' },
    { id: 2, title: 'New Arrivals', subtitle: 'Latest Cricket Gear', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop', color: '#9D4EDD' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          CRICK<Text style={styles.headerTitleOrange}>STORE</Text>
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
      </View>

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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Deals</Text>
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
                  color={activeCategory === category.id ? '#FFF' : '#9D4EDD'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    activeCategory === category.id && styles.activeCategoryChipText,
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <TouchableOpacity>
              <Ionicons name="options-outline" size={24} color="#9D4EDD" />
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <ImageBackground
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  imageStyle={styles.productImageStyle}
                >
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{product.discount}</Text>
                  </View>
                  <TouchableOpacity style={styles.wishlistButton}>
                    <Ionicons name="heart-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                </ImageBackground>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                  </View>
                  <TouchableOpacity style={styles.addToCartButton}>
                    <Ionicons name="cart" size={16} color="#FFF" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E8FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#9D4EDD',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerTitleOrange: {
    color: '#FFD60A',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B8A',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  dealCard: {
    width: 300,
    height: 150,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  dealImageStyle: {
    borderRadius: 12,
  },
  dealOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    justifyContent: 'center',
  },
  dealTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  dealSubtitle: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 12,
  },
  dealButton: {
    backgroundColor: '#FFD60A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dealButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoriesSection: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingLeft: 16,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    marginRight: 12,
    gap: 6,
  },
  activeCategoryChip: {
    backgroundColor: '#9D4EDD',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9D4EDD',
  },
  activeCategoryChipText: {
    color: '#FFF',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  productImage: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  productImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9D4EDD',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#9D4EDD',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});
