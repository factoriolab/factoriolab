import {
  FlowDiagram,
  Game,
  Language,
  LinkValue,
  PowerUnit,
  SankeyAlign,
  Theme,
} from '~/models';
import * as App from '../app.actions';
import * as Actions from './preferences.actions';
import {
  initialPreferencesState,
  preferencesReducer,
} from './preferences.reducer';

describe('Preferences Reducer', () => {
  const id = 'id';
  const value = 'value';

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = preferencesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialPreferencesState);
    });
  });

  describe('SAVE_STATE', () => {
    it('should save the specified state', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SaveStateAction({
          key: Game.Factorio,
          id,
          value,
        }),
      );
      expect(result.states[Game.Factorio]).toEqual({ [id]: value });
    });
  });

  describe('REMOVE_STATE', () => {
    it('should remove the specified state', () => {
      const result = preferencesReducer(
        { states: { [Game.Factorio]: { [id]: value } } } as any,
        new Actions.RemoveStateAction({ key: Game.Factorio, id }),
      );
      expect(result.states[Game.Factorio]).toEqual({});
    });
  });

  describe('SET_STATES', () => {
    it('should set all saved states', () => {
      const result = preferencesReducer(
        { states: { [Game.Factorio]: { [id]: value } } } as any,
        new Actions.SetStatesAction(initialPreferencesState.states),
      );
      expect(result.states).toEqual(initialPreferencesState.states);
    });
  });

  describe('SET_COLUMNS', () => {
    it('should set the columns state', () => {
      const columns = { power: { show: true } } as any;
      const result = preferencesReducer(
        undefined,
        new Actions.SetColumnsAction(columns),
      );
      expect(result.columns).toEqual(columns);
    });

    it('should reset power unit if power column is hidden', () => {
      const result = preferencesReducer(
        { powerUnit: PowerUnit.MW } as any,
        new Actions.SetColumnsAction({ power: {} } as any),
      );
      expect(result.powerUnit).toEqual(PowerUnit.Auto);
    });
  });

  describe('SET_ROWS', () => {
    it('should set the paging rows', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetRowsAction(25),
      );
      expect(result.rows).toEqual(25);
    });
  });

  describe('SET_DISABLE_PAGINATOR', () => {
    it('should set whether paginator is disabled', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetDisablePaginatorAction(true),
      );
      expect(result.disablePaginator).toBeTrue();
    });
  });

  describe('SET_LANGUAGE', () => {
    it('should set the language', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetLanguageAction(Language.Chinese),
      );
      expect(result.language).toEqual(Language.Chinese);
    });
  });

  describe('SET_POWER_UNIT', () => {
    it('should set the power unit', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetPowerUnitAction(PowerUnit.MW),
      );
      expect(result.powerUnit).toEqual(PowerUnit.MW);
    });
  });

  describe('SET_THEME', () => {
    it('should set the power unit', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetThemeAction(Theme.Dark),
      );
      expect(result.theme).toEqual(Theme.Dark);
    });
  });

  describe('SET_BYPASS_LANDING', () => {
    it('should set the bypass landing preference', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetBypassLandingAction(true),
      );
      expect(result.bypassLanding).toEqual(true);
    });
  });

  describe('SET_SHOW_TECH_LABELS', () => {
    it('should set the show tech labels preference', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetShowTechLabelsAction(true),
      );
      expect(result.showTechLabels).toEqual(true);
    });
  });

  describe('SET_HIDE_DUPLICATE_ICONS', () => {
    it('should set the hide duplicate icons preference', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetHideDuplicateIconsAction(true),
      );
      expect(result.hideDuplicateIcons).toEqual(true);
    });
  });

  describe('SET_PAUSED', () => {
    it('should set the paused state', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetPausedAction(true),
      );
      expect(result.paused).toEqual(true);
    });
  });

  describe('SET_FLOW_DIAGRAM', () => {
    it('should set the flow diagram', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetFlowDiagramAction(FlowDiagram.BoxLine),
      );
      expect(result.flowDiagram).toEqual(FlowDiagram.BoxLine);
    });
  });

  describe('SET_LINK_SIZE', () => {
    it('should set the link size', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetLinkSizeAction(LinkValue.Percent),
      );
      expect(result.linkSize).toEqual(LinkValue.Percent);
    });
  });

  describe('SET_LINK_TEXT', () => {
    it('should set the link text', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetLinkTextAction(LinkValue.Percent),
      );
      expect(result.linkText).toEqual(LinkValue.Percent);
    });
  });

  describe('SET_SANKEY_ALIGN', () => {
    it('should set the sankey align', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetSankeyAlignAction(SankeyAlign.Left),
      );
      expect(result.sankeyAlign).toEqual(SankeyAlign.Left);
    });
  });

  describe('SET_FLOW_HIDE_EXCLUDED', () => {
    it('should set flow hide excluded state', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetFlowHideExcludedAction(false),
      );
      expect(result.flowHideExcluded).toEqual(false);
    });
  });

  it('should return the default state', () => {
    expect(preferencesReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialPreferencesState,
    );
  });
});
