import { Share, Platform, Alert, Linking as RNLinking } from 'react-native';
import * as Linking from 'expo-linking';

export interface ShareOptions {
  title: string;
  message: string;
  type: 'post' | 'match' | 'news' | 'app';
  id?: string | number;
}

/**
 * Utility function to open the native share sheet
 */
export const shareContent = async (options: ShareOptions): Promise<boolean> => {
  const { title, message, type, id } = options;

  // Generate deep link back to the app using scheme "gamelens"
  const deepLink = id 
    ? Linking.createURL(`${type}/${id}`) 
    : Linking.createURL(type);

  const webFallbackUrl = id 
    ? `https://gamelens.com/${type}/${id}` 
    : 'https://gamelens.com';

  const fullMessage = `${title}\n\n${message}\n\nOpen in GameLens: ${deepLink}\nWeb link: ${webFallbackUrl}`;

  try {
    const sharePayload = Platform.select({
      ios: {
        message: fullMessage,
        url: webFallbackUrl, // iOS uses this for rich previews
      },
      default: {
        message: fullMessage,
      },
    });

    const result = await Share.share(sharePayload, {
      dialogTitle: `Share ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      subject: title,
    });

    return result.action === Share.sharedAction;
  } catch (error: any) {
    Alert.alert('Error sharing', error.message || 'Could not complete sharing action.');
    return false;
  }
};

/**
 * Share directly to a specific platform, falling back to native share sheet if app not installed
 */
export const shareToPlatform = async (platform: string, options: ShareOptions): Promise<boolean> => {
  const { title, message, type, id } = options;
  const deepLink = id ? Linking.createURL(`${type}/${id}`) : Linking.createURL(type);
  const webFallbackUrl = id ? `https://gamelens.com/${type}/${id}` : 'https://gamelens.com';
  const fullText = `${title}\n\n${message}\n\nOpen in GameLens: ${deepLink}`;

  let targetUrl = '';

  switch (platform.toLowerCase()) {
    case 'whatsapp':
      targetUrl = `whatsapp://send?text=${encodeURIComponent(fullText)}`;
      break;
    case 'twitter':
    case 'x':
      targetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
      break;
    case 'facebook':
      targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(webFallbackUrl)}`;
      break;
    case 'telegram':
      targetUrl = `https://t.me/share/url?url=${encodeURIComponent(webFallbackUrl)}&text=${encodeURIComponent(fullText)}`;
      break;
    case 'email':
      targetUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullText)}`;
      break;
    default:
      // Use native sharing sheet for 'more' or unsupported platforms
      return await shareContent(options);
  }

  try {
    const supported = await RNLinking.canOpenURL(targetUrl);
    if (supported) {
      await RNLinking.openURL(targetUrl);
      return true;
    } else {
      // Platform-specific web fallbacks
      if (platform.toLowerCase() === 'whatsapp') {
        const webUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
        await RNLinking.openURL(webUrl);
        return true;
      }
      // Fallback to general native share sheet
      return await shareContent(options);
    }
  } catch (error) {
    // Fallback to native share sheet
    return await shareContent(options);
  }
};
