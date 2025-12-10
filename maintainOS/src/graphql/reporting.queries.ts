import { gql } from "@apollo/client";

export const GET_CHART_DATA = gql`
  query GetChartData($input: ChartDataInput!) {
    getChartData(input: $input) {
      groupValues
      value
      totalTimeMinutes
      totalCost
      mttrAvgHours
    }
  }
`;
