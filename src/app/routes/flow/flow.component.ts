import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import ELK, { ELK as ElkType, ElkNode } from 'elkjs/lib/elk.bundled';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { DataSet } from 'vis-data/esnext';
import { Data, Edge, Network, Node, Options } from 'vis-network/esnext';

import { FlowData } from '~/models';
import { DisplayService, FlowService } from '~/services';

@UntilDestroy()
@Component({
  selector: 'lab-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowComponent implements AfterViewInit {
  loading$ = new BehaviorSubject(true);

  vm$ = combineLatest([this.loading$]).pipe(map(([loading]) => ({ loading })));

  constructor(
    private displaySvc: DisplayService,
    private flowSvc: FlowService
  ) {}

  ngAfterViewInit(): void {
    this.flowSvc.flowData$
      .pipe(untilDestroyed(this))
      .subscribe((flowData) => this.rebuildChart(flowData));
  }

  rebuildChart(flowData: FlowData): void {
    this.loading$.next(true);

    const nodes = new DataSet<Node>();

    nodes.add(
      flowData.nodes.map((n) => {
        const el = document.createElement('div');
        el.classList.add('d-flex', 'flex-column', 'align-items-center');
        el.innerHTML += `<div>${n.name}</div>`;
        if (n.recipe) {
          el.innerHTML += `<div class="d-flex align-items-center mt-2">${this.displaySvc.recipeProcess(
            n.recipe
          )}</div>`;
          if (n.factories != null && n.factoryId != null) {
            el.innerHTML += `<div class="d-flex align-items-center mt-2">${this.displaySvc.icon(
              n.factoryId,
              n.factories
            )}</div>`;
          }
        }
        const nodeTheme = flowData.theme.node[n.type];
        return {
          id: n.id,
          label: `<b>${n.name}</b>\n${n.text}`,
          title: el,
          color: nodeTheme.background,
          font: {
            color: nodeTheme.color,
          },
        };
      })
    );

    const edges = new DataSet<Edge>();
    const duplicateMap: Record<string, number> = {};
    edges.add(
      flowData.links.map((l) => {
        const id = `${l.source}|${l.target}`;
        duplicateMap[id] = (duplicateMap[id] ?? 0) + 1;

        return {
          from: l.source,
          to: l.target,
          label: l.text + '\n' + l.name,
          title: l.text + '\n' + l.name,
          smooth: flowData.links.some(
            (a) =>
              (a.target === l.source && l.target === a.source) ||
              (a.target === l.target &&
                a.source === l.source &&
                a.name !== l.name)
          )
            ? {
                enabled: true,
                type: 'curvedCW',
                roundness: duplicateMap[id] * 0.3,
              }
            : { enabled: false },
          selfReference: {
            size: duplicateMap[id] * 50,
          },
          font: {
            color: flowData.theme.edge,
          },
        };
      })
    );
    const container = document.getElementById('lab-flow-svg');
    const data: Data = {
      nodes: nodes,
      edges: edges,
    };
    const options: Options = {
      height: '800px',
      edges: {
        labelHighlightBold: false,
        font: {
          size: 16,
          multi: 'html',
          strokeColor: 'rgba(0, 0, 0, 0.2)',
          face: 'segoe ui',
          align: 'middle',
        },
        arrows: 'to',
        smooth: false,
        scaling: {
          label: false,
        },
      },
      nodes: {
        labelHighlightBold: false,
        shape: 'box',
        font: { multi: 'html' },
        margin: {
          top: 10,
          left: 10,
          right: 10,
          bottom: 10,
        },
        widthConstraint: {
          minimum: 50,
          maximum: 250,
        },
      },
      layout: {
        improvedLayout: false,
      },
      physics: {
        enabled: false,
      },
    };

    if (container) {
      const network = new Network(container, data, options);

      const graph: ElkNode = {
        id: 'root',
        children: flowData.nodes.map((n) => ({
          id: n.id,
          width: 250,
          height: 100,
        })),
        edges: flowData.links.map((l) => ({
          id: '',
          sources: [l.source],
          targets: [l.target],
        })),
        layoutOptions: {
          'elk.algorithm': 'org.eclipse.elk.layered',
          'org.eclipse.elk.layered.nodePlacement.favorStraightEdges': 'true',
          'org.eclipse.elk.spacing.nodeNode': '40',
        },
      };

      const elk = this.getElk();

      elk.layout(graph).then((data) => {
        if (data.children == null) return;

        const children = data.children;

        nodes.forEach((node) => {
          const item = children.find((c) => c.id === node.id);
          if (item) {
            nodes.update({ id: node.id, x: item.x, y: item.y });
          }
        });

        network.fit();
        this.loading$.next(false);
      });
    }
  }

  /** Mockable helper method for tests */
  getElk(): ElkType {
    return new ELK();
  }
}
