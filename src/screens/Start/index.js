import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import styles from './styles';

const Start = ({ onNavigate }) => {
  const handleStart = () => {
    onNavigate('Login');
  };

  const StarIcon = ({ size = 22, color = 'white' }) => (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M8.93548 14.5002C8.8462 14.1542 8.66581 13.8384 8.41309 13.5856C8.16037 13.3329 7.84455 13.1525 7.49848 13.0632L1.36348 11.4812C1.25881 11.4515 1.16668 11.3885 1.10109 11.3017C1.03549 11.2149 1 11.1091 1 11.0002C1 10.8914 1.03549 10.7856 1.10109 10.6988C1.16668 10.612 1.25881 10.549 1.36348 10.5192L7.49848 8.93625C7.84442 8.84706 8.16017 8.66682 8.41288 8.41429C8.66559 8.16175 8.84604 7.84614 8.93548 7.50025L10.5175 1.36525C10.5469 1.26017 10.6099 1.16759 10.6968 1.10164C10.7837 1.0357 10.8899 1 10.999 1C11.1081 1 11.2142 1.0357 11.3012 1.10164C11.3881 1.16759 11.4511 1.26017 11.4805 1.36525L13.0615 7.50025C13.1508 7.84632 13.3311 8.16215 13.5839 8.41487C13.8366 8.66759 14.1524 8.84797 14.4985 8.93725L20.6335 10.5182C20.739 10.5473 20.832 10.6103 20.8983 10.6973C20.9646 10.7844 21.0005 10.8908 21.0005 11.0002C21.0005 11.1097 20.9646 11.2161 20.8983 11.3032C20.832 11.3902 20.739 11.4531 20.6335 11.4822L14.4985 13.0632C14.1524 13.1525 13.8366 13.3329 13.5839 13.5856C13.3311 13.8384 13.1508 14.1542 13.0615 14.5002L11.4795 20.6353C11.4501 20.7403 11.3871 20.8329 11.3002 20.8989C11.2132 20.9648 11.1071 21.0005 10.998 21.0005C10.8889 21.0005 10.7827 20.9648 10.6958 20.8989C10.6089 20.8329 10.5459 20.7403 10.5165 20.6353L8.93548 14.5002Z"
        fill={color}
      />
    </Svg>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Decorative Circles */}
      <View style={styles.backgroundElements}>
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          {/* Header Logo */}
          <View style={styles.headerLogo}>
            <View style={styles.logoIconContainer}>
              <StarIcon size={24} />
            </View>
            <Text style={styles.headerText}>MatchTea</Text>
          </View>

          {/* Main Landscape Card */}
          <View style={styles.mainCard}>
            <View style={styles.imageWrapper}>
              <Image 
                source={require('../../assets/images/match_tea_landscape.png')} 
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.starOverlay}>
                <StarIcon size={16} />
              </View>
            </View>
          </View>

          {/* Bottom Branding & Tagline */}
          <View style={styles.brandingContainer}>
            <Text style={styles.brandName}>MatchTea</Text>
            <Text style={styles.tagline}>Fresh drinks, happy moments!</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>BẮT ĐẦU NGAY</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </View>
  );
};

export default Start;
