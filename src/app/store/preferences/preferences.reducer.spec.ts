import { spread } from '~/helpers';
import { FlowDiagram } from '~/models/enum/flow-diagram';
import { Game } from '~/models/enum/game';
import { Language } from '~/models/enum/language';
import { PowerUnit } from '~/models/enum/power-unit';
import { Theme } from '~/models/enum/theme';
import { Mocks } from '~/tests';

import { reset } from '../app.actions';
import {
  removeState,
  saveState,
  setBypassLanding,
  setColumns,
  setConvertObjectiveValues,
  setDisablePaginator,
  setFlowSettings,
  setHideDuplicateIcons,
  setLanguage,
  setPaused,
  setPowerUnit,
  setRows,
  setShowTechLabels,
  setStates,
  setTheme,
} from './preferences.actions';
import {
  initialPreferencesState,
  preferencesReducer,
} from './preferences.reducer';

describe('Preferences Reducer', () => {
  const id = 'id';
  const value = 'value';

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = preferencesReducer(undefined, reset());
      expect(result).toEqual(initialPreferencesState);
    });
  });

  describe('SAVE_STATE', () => {
    it('should save the specified state', () => {
      const result = preferencesReducer(
        undefined,
        saveState({
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
        removeState({ key: Game.Factorio, id }),
      );
      expect(result.states[Game.Factorio]).toEqual({});
    });
  });

  describe('SET_STATES', () => {
    it('should set all saved states', () => {
      const result = preferencesReducer(
        { states: { [Game.Factorio]: { [id]: value } } } as any,
        setStates({ states: initialPreferencesState.states }),
      );
      expect(result.states).toEqual(initialPreferencesState.states);
    });
  });

  describe('SET_COLUMNS', () => {
    it('should set the columns state', () => {
      const columns = { power: { show: true } } as any;
      const result = preferencesReducer(undefined, setColumns({ columns }));
      expect(result.columns).toEqual(columns);
    });
  });

  describe('SET_ROWS', () => {
    it('should set the paging rows', () => {
      const rows = 25;
      const result = preferencesReducer(undefined, setRows({ rows }));
      expect(result.rows).toEqual(rows);
    });
  });

  describe('SET_DISABLE_PAGINATOR', () => {
    it('should set whether paginator is disabled', () => {
      const disablePaginator = true;
      const result = preferencesReducer(
        undefined,
        setDisablePaginator({ disablePaginator }),
      );
      expect(result.disablePaginator).toEqual(disablePaginator);
    });
  });

  describe('SET_LANGUAGE', () => {
    it('should set the language', () => {
      const language = Language.Chinese;
      const result = preferencesReducer(undefined, setLanguage({ language }));
      expect(result.language).toEqual(language);
    });
  });

  describe('SET_POWER_UNIT', () => {
    it('should set the power unit', () => {
      const powerUnit = PowerUnit.MW;
      const result = preferencesReducer(undefined, setPowerUnit({ powerUnit }));
      expect(result.powerUnit).toEqual(powerUnit);
    });
  });

  describe('SET_THEME', () => {
    it('should set the power unit', () => {
      const theme = Theme.Dark;
      const result = preferencesReducer(undefined, setTheme({ theme }));
      expect(result.theme).toEqual(theme);
    });
  });

  describe('SET_BYPASS_LANDING', () => {
    it('should set the bypass landing preference', () => {
      const bypassLanding = true;
      const result = preferencesReducer(
        undefined,
        setBypassLanding({ bypassLanding }),
      );
      expect(result.bypassLanding).toEqual(bypassLanding);
    });
  });

  describe('SET_SHOW_TECH_LABELS', () => {
    it('should set the show tech labels preference', () => {
      const showTechLabels = true;
      const result = preferencesReducer(
        undefined,
        setShowTechLabels({ showTechLabels }),
      );
      expect(result.showTechLabels).toEqual(showTechLabels);
    });
  });

  describe('SET_HIDE_DUPLICATE_ICONS', () => {
    it('should set the hide duplicate icons preference', () => {
      const hideDuplicateIcons = true;
      const result = preferencesReducer(
        undefined,
        setHideDuplicateIcons({ hideDuplicateIcons }),
      );
      expect(result.hideDuplicateIcons).toEqual(true);
    });
  });

  describe('SET_PAUSED', () => {
    it('should set the paused state', () => {
      const paused = true;
      const result = preferencesReducer(undefined, setPaused({ paused }));
      expect(result.paused).toEqual(paused);
    });
  });

  describe('SET_CONVERT_OBJECTIVE_VALUES', () => {
    it('should set the convert objective values state', () => {
      const convertObjectiveValues = true;
      const result = preferencesReducer(
        undefined,
        setConvertObjectiveValues({ convertObjectiveValues }),
      );
      expect(result.convertObjectiveValues).toEqual(convertObjectiveValues);
    });
  });

  describe('SET_FLOW_SETTINGS', () => {
    it('should set the flow settings', () => {
      const flowSettings = spread(Mocks.flowSettings, {
        diagram: FlowDiagram.BoxLine,
      });
      const result = preferencesReducer(
        undefined,
        setFlowSettings({ flowSettings }),
      );
      expect(result.flowSettings).toEqual(flowSettings);
    });
  });

  it('should return the default state', () => {
    expect(preferencesReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialPreferencesState,
    );
  });
});
