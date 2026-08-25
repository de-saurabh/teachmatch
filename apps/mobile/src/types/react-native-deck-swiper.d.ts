declare module "react-native-deck-swiper" {
  import type { Component, ReactElement } from "react";
  import type { ViewStyle } from "react-native";

  export interface SwiperProps<T> {
    cards: T[];
    renderCard: (card: T, index: number) => ReactElement | null;
    onSwipedLeft?: (index: number) => void;
    onSwipedRight?: (index: number) => void;
    onSwipedAll?: () => void;
    cardIndex?: number;
    backgroundColor?: string;
    stackSize?: number;
    verticalSwipe?: boolean;
    containerStyle?: ViewStyle;
    cardStyle?: ViewStyle;
    disableTopSwipe?: boolean;
    disableBottomSwipe?: boolean;
  }

  export default class Swiper<T> extends Component<SwiperProps<T>> {
    swipeLeft(): void;
    swipeRight(): void;
  }
}
