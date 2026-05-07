import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, Dimensions, RefreshControl } from 'react-native';
import productApi from '../../../api/productApi';

const { width } = Dimensions.get('window');

const MenuTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const res = await productApi.getAllProducts();
      const products = Array.isArray(res) ? res : (res?.data || []);

      // Nhóm sản phẩm theo danh mục
      const grouped = {};
      products.forEach(p => {
        const catName = p.tenDanhMuc || 'Khác';
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(p);
      });

      // Tách Toppings ra cuối cùng nếu cần thiết, hoặc để nguyên
      setCategories(grouped);
    } catch (err) {
      console.log('Fetch menu error:', err);
    } finally {
      if (!isRefresh) setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  const renderVariants = (variants) => {
    if (!variants || variants.length === 0) return null;
    
    // Nếu chỉ có 1 size (ví dụ Topping)
    if (variants.length === 1) {
      const v = variants[0];
      return <Text style={styles.priceText}>{Number(v.giaBan).toLocaleString('vi-VN')}đ</Text>;
    }

    // Nếu nhiều size
    const sorted = [...variants].sort((a, b) => a.giaBan - b.giaBan);
    const minPrice = sorted[0].giaBan;
    
    return (
      <View style={styles.variantContainer}>
        <Text style={styles.priceText}>từ {Number(minPrice).toLocaleString('vi-VN')}đ</Text>
        <Text style={styles.variantDetails}>
          ({sorted.map(v => `${v.tenKichCo}: ${Number(v.giaBan / 1000)}k`).join(' • ')})
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#4A924C" />
        <Text style={styles.loadingText}>Đang chuẩn bị thực đơn...</Text>
      </View>
    );
  }

  // Chia danh mục thành 2 cột cho giống cuốn menu mở ra
  const catNames = Object.keys(categories);
  const half = Math.ceil(catNames.length / 2);
  const leftCats = catNames.slice(0, half);
  const rightCats = catNames.slice(half);

  return (
    <View style={styles.container}>
      {/* Nền giấy nhám của cuốn Menu */}
      <View style={styles.paperBackground}>
        
        {/* Khung viền Vintage */}
        <View style={styles.vintageBorder}>
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A924C']} />}
          >
            {/* Tiêu đề Menu */}
            <View style={styles.headerWrap}>
              <Text style={styles.decorIcon}>🍃</Text>
              <Text style={styles.mainTitle}>MatchTea Menu</Text>
              <Text style={styles.subTitle}>Hương vị tinh hoa từ những lá trà tươi</Text>
              <View style={styles.dividerWrap}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerDiamond}>❖</Text>
                <View style={styles.dividerLine} />
              </View>
            </View>

            <View style={styles.columnsWrap}>
              {/* Cột trái */}
              <View style={styles.column}>
                {leftCats.map(cat => (
                  <View key={cat} style={styles.categoryBlock}>
                    <Text style={styles.categoryTitle}>~ {cat} ~</Text>
                    {categories[cat].map(item => (
                      <View key={item.idSanPham} style={styles.itemWrap}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.tenSanPham}</Text>
                          <View style={styles.dottedLeader} />
                          {item.danhSachBienThe?.length === 1 && (
                            <Text style={styles.priceText}>
                              {Number(item.danhSachBienThe[0].giaBan).toLocaleString('vi-VN')}đ
                            </Text>
                          )}
                        </View>
                        {item.danhSachBienThe?.length > 1 && (
                          <View style={styles.variantDetailsWrap}>
                            <Text style={styles.variantDetails}>
                              {item.danhSachBienThe.sort((a,b) => a.giaBan - b.giaBan).map(v => `${v.tenKichCo}: ${Number(v.giaBan / 1000)}k`).join('  |  ')}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>

              {/* Đường kẻ giữa cuốn menu */}
              <View style={styles.spineDivider} />

              {/* Cột phải */}
              <View style={styles.column}>
                {rightCats.map(cat => (
                  <View key={cat} style={styles.categoryBlock}>
                    <Text style={styles.categoryTitle}>~ {cat} ~</Text>
                    {categories[cat].map(item => (
                      <View key={item.idSanPham} style={styles.itemWrap}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.tenSanPham}</Text>
                          <View style={styles.dottedLeader} />
                          {item.danhSachBienThe?.length === 1 && (
                            <Text style={styles.priceText}>
                              {Number(item.danhSachBienThe[0].giaBan).toLocaleString('vi-VN')}đ
                            </Text>
                          )}
                        </View>
                        {item.danhSachBienThe?.length > 1 && (
                          <View style={styles.variantDetailsWrap}>
                            <Text style={styles.variantDetails}>
                              {item.danhSachBienThe.sort((a,b) => a.giaBan - b.giaBan).map(v => `${v.tenKichCo}: ${Number(v.giaBan / 1000)}k`).join('  |  ')}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.footerWrap}>
              <Text style={styles.footerText}>* Menu có thể thay đổi tùy theo mùa và nguồn nguyên liệu</Text>
              <Text style={styles.footerText}>Xin trân trọng cảm ơn quý khách!</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
  },
  paperBackground: {
    flex: 1,
    backgroundColor: '#FDFBF7', // Màu giấy nến cổ điển
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    padding: 16,
  },
  vintageBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D4C3A3',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrap: {
    alignItems: 'center',
    marginVertical: 32,
  },
  decorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 48,
    fontFamily: 'serif',
    fontWeight: '700',
    color: '#2A3F2D',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#5C6B5D',
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    width: '60%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4C3A3',
  },
  dividerDiamond: {
    marginHorizontal: 12,
    color: '#D4C3A3',
    fontSize: 12,
  },
  columnsWrap: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  column: {
    flex: 1,
    paddingHorizontal: 24,
  },
  spineDivider: {
    width: 1,
    backgroundColor: '#EAE0C8',
    marginHorizontal: 10,
  },
  categoryBlock: {
    marginBottom: 40,
  },
  categoryTitle: {
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#3E5C43',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  itemWrap: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D3748',
  },
  dottedLeader: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C3A3',
    borderStyle: 'dotted',
    marginHorizontal: 12,
    marginBottom: 6,
  },
  priceText: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#2D3748',
  },
  variantDetailsWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  variantDetails: {
    fontSize: 13,
    color: '#718096',
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  footerWrap: {
    marginTop: 60,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EAE0C8',
    paddingTop: 24,
    marginHorizontal: 100,
  },
  footerText: {
    fontSize: 13,
    color: '#A0AEC0',
    fontStyle: 'italic',
    fontFamily: 'serif',
    lineHeight: 22,
  },
});

export default MenuTab;
