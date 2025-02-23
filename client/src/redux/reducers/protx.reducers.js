export const initialState = {
  loading: true,
  error: false,
  data: null
};

export function protx(state = initialState, action) {
  switch (action.type) {
    case 'PROTX_INIT':
      return {
        ...initialState,
        loading: true
      };
    case 'PROTX_SUCCESS':
      return {
        ...state,
        data: { ...action.payload },
        loading: false
      };
    case 'PROTX_FAILURE':
      return {
        ...initialState,
        error: true
      };
    default:
      return state;
  }
}

export const initialDemographicsDistributionState = {
  loading: true,
  error: false,
  data: null
};

export function protxDemographicsDistribution(
  state = initialDemographicsDistributionState,
  action
) {
  switch (action.type) {
    case 'PROTX_DEMOGRAPHIC_DISTRIBUTION_INIT':
      return {
        ...initialDemographicsDistributionState,
        loading: true
      };
    case 'PROTX_DEMOGRAPHIC_DISTRIBUTION_SUCCESS':
      return {
        ...state,
        data: action.payload.data,
        loading: false
      };
    case 'PROTX_DEMOGRAPHIC_DISTRIBUTION_FAILURE':
      return {
        ...initialDemographicsDistributionState,
        error: true
      };
    default:
      return state;
  }
}
