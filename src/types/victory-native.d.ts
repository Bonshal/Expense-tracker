declare module 'victory-native' {
  import { ViewStyle } from 'react-native';

  export interface VictoryTheme {
    axis: {
      style: {
        tickLabels: {
          fill: string;
          fontSize: number;
          angle?: number;
        };
      };
    };
  }

  export interface VictoryDatum {
    x: string | number;
    y: number;
    category?: string;
    total?: number;
  }

  export interface VictoryPieProps {
    data: VictoryDatum[];
    colorScale?: string[];
    width?: number;
    height?: number;
    innerRadius?: number;
    labelComponent?: React.ReactElement;
    labels?: (props: { datum: VictoryDatum }) => string;
    style?: {
      labels?: {
        fill: string;
        fontSize: number;
        padding: number;
      };
    };
    padding?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  }

  export interface VictoryChartProps {
    theme?: VictoryTheme;
    width?: number;
    height?: number;
    padding?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    children: React.ReactNode;
  }

  export interface VictoryAxisProps {
    tickFormat?: (t: string | number) => string;
    style?: {
      tickLabels?: {
        fill: string;
        fontSize: number;
        angle?: number;
      };
    };
    dependentAxis?: boolean;
    label?: React.ReactElement | ((props: { datum: VictoryDatum }) => string);
  }

  export interface VictoryLineProps {
    data: VictoryDatum[];
    style?: {
      data?: {
        stroke: string;
      };
    };
  }

  export interface VictoryBarProps {
    data: VictoryDatum[];
    style?: {
      data?: {
        fill: string;
      };
    };
  }

  export const VictoryPie: React.FC<VictoryPieProps>;
  export const VictoryChart: React.FC<VictoryChartProps>;
  export const VictoryAxis: React.FC<VictoryAxisProps>;
  export const VictoryLine: React.FC<VictoryLineProps>;
  export const VictoryBar: React.FC<VictoryBarProps>;
} 