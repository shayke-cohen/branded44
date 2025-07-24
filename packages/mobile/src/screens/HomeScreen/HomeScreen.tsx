import React, {useState, useEffect} from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions,
  SafeAreaView
} from 'react-native';
import {useTheme} from '../../context';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const {theme} = useTheme();
  const [animatedValue] = useState(new Animated.Value(0));
  const [sparkleAnimation] = useState(new Animated.Value(0));
  const [currentTip, setCurrentTip] = useState(0);

  const dreamAppTips = [
    "🎯 This app can be updated to match any vision you have!",
    "🚀 Describe changes and watch AI implement them instantly",
    "💡 Your imagination is the only limit to what this app can become",
    "🌟 Every feature you dream of can be added with simple conversation",
    "🎨 AI can redesign any screen to match your perfect vision",
    "🔮 This living app evolves with your needs and desires!"
  ];



  useEffect(() => {
    // Main bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cycle through tips
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % dreamAppTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  const bounceTransform = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const sparkleOpacity = sparkleAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const sparkleRotate = sparkleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    mainTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    aiIconContainer: {
      position: 'relative',
      marginVertical: 20,
    },
    aiIcon: {
      fontSize: 80,
      textAlign: 'center',
    },
    sparkle: {
      position: 'absolute',
      fontSize: 20,
    },
    sparkle1: {
      top: -10,
      right: -10,
    },
    sparkle2: {
      bottom: -10,
      left: -10,
    },
    sparkle3: {
      top: 10,
      left: -20,
    },
    dreamCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      marginVertical: 20,
      width: width - 40,
      borderWidth: 2,
      borderColor: theme.colors.primary + '20',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    dreamTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    dreamDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 20,
    },
    tipContainer: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 15,
      padding: 16,
      marginVertical: 20,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    tipText: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    buttonsContainer: {
      width: '100%',
      gap: 16,
      marginTop: 20,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    buttonDescription: {
      color: '#FFFFFF',
      fontSize: 14,
      opacity: 0.9,
      textAlign: 'center',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    buttonDescriptionSecondary: {
      color: theme.colors.primary,
      fontSize: 14,
      opacity: 0.8,
      textAlign: 'center',
    },
    featuresContainer: {
      width: '100%',
      marginTop: 30,
    },
    featuresTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 12,
    },
    featureIcon: {
      fontSize: 24,
      marginRight: 16,
      width: 32,
    },
    featureText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    footer: {
      marginTop: 40,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },



  });

  const features = [
    { icon: '🤖', text: 'AI-Powered App Updates' },
    { icon: '⚡', text: 'Instant Feature Implementation' },
    { icon: '🎨', text: 'Dynamic UI Customization' },
    { icon: '🔧', text: 'No-Code Modifications' },
    { icon: '📱', text: 'Live App Transformation' },
    { icon: '🚀', text: 'Real-Time Dream Realization' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.heroContainer}>
          <Text style={styles.mainTitle}>✨ branded44 AI Builder ✨</Text>
          <Text style={styles.subtitle}>Your AI-Powered App Creation Studio</Text>
          
          <Animated.View 
            style={[
              styles.aiIconContainer,
              { transform: [{ scale: bounceTransform }] }
            ]}
          >
            <Text style={styles.aiIcon}>🤖</Text>
            <Animated.Text 
              style={[
                styles.sparkle, 
                styles.sparkle1,
                { 
                  opacity: sparkleOpacity,
                  transform: [{ rotate: sparkleRotate }]
                }
              ]}
            >
              ✨
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.sparkle, 
                styles.sparkle2,
                { 
                  opacity: sparkleOpacity,
                  transform: [{ rotate: sparkleRotate }]
                }
              ]}
            >
              ⭐
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.sparkle, 
                styles.sparkle3,
                { 
                  opacity: sparkleOpacity,
                  transform: [{ rotate: sparkleRotate }]
                }
              ]}
            >
              💫
            </Animated.Text>
          </Animated.View>
        </View>



        <View style={styles.dreamCard}>
          <Text style={styles.dreamTitle}>🌟 Your Dream App Awaits 🌟</Text>
          <Text style={styles.dreamDescription}>
            This app was intelligently created with AI and can be continuously updated to match your exact vision! 
            Simply describe what you want to change, add, or improve, and watch as AI transforms this app into 
            your perfect digital companion. Your imagination is the only limit!
          </Text>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>{dreamAppTips[currentTip]}</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>🤖 Chat to Update This App</Text>
            <Text style={styles.buttonDescription}>Describe changes and watch AI transform this app</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>✨ Explore Current Features</Text>
            <Text style={styles.buttonDescriptionSecondary}>See what this app can already do for you</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>🎯 What Makes Us Special</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

                <View style={styles.footer}>
          <Text style={styles.footerText}>
            💭 "This app is your canvas - paint your digital dreams into reality"
          </Text>
        </View>
       </ScrollView>
     </SafeAreaView>
   );
 };

export default HomeScreen; 