import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { DataSet } from 'vis-data/esnext';
import { IdType } from 'vis-network';
import { Data, Edge, Network, Node, Options } from 'vis-network/esnext';

import { DisplayService } from '~/services/display.service';
import { LabState, Products } from '~/store';

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
    private store: Store<LabState>,
    private displaySvc: DisplayService
  ) {}

  ngAfterViewInit(): void {
    this.store
      .select(Products.getGraph)
      .pipe(untilDestroyed(this))
      .subscribe((sankey) => {
        this.loading$.next(true);

        const nodes = new DataSet<Node>();

        nodes.add(
          sankey.nodes.map((n) => {
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
            return {
              id: n.id,
              label: `<b>${n.name}</b>\n${n.subtext}`,
              title: el,
              color: n.color,
            };
          })
        );

        const edges = new DataSet<Edge>();
        edges.add(
          sankey.links.map((l) => ({
            from: l.source,
            to: l.target,
            label: l.text + '\n' + l.name,
            title: l.text + '\n' + l.name,
            smooth: sankey.links.some(
              (a) => a.target === l.source && l.target === a.source
            )
              ? { enabled: true, type: 'curvedCW', roundness: 0.2 }
              : { enabled: false },
            font: {
              color: 'white',
            },
          }))
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
            chosen: { node: this.clickNode, label: false },
          },
          layout: {
            improvedLayout: false,
            hierarchical: false,
          },
          physics: {
            enabled: false,
          },
        };

        if (container) {
          const network = new Network(container, data, options);

          const graph: ElkNode = {
            id: 'root',
            children: sankey.nodes.map((n) => ({
              id: n.id,
              width: 250,
              height: 100,
            })),
            edges: sankey.links.map((l) => ({
              id: '',
              sources: [l.source],
              targets: [l.target],
            })),
            layoutOptions: {
              'elk.algorithm': 'org.eclipse.elk.layered',
              'org.eclipse.elk.layered.nodePlacement.favorStraightEdges':
                'true',
              'org.eclipse.elk.spacing.nodeNode': '40',
            },
          };

          const elk = new ELK();

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
      });
  }

  clickNode<T>(
    values: T,
    id: IdType,
    selected: boolean,
    hovered: boolean
  ): void {
    if (selected) {
      console.log(values, id);
    } else {
      console.log('unselected');
    }
  }
}
