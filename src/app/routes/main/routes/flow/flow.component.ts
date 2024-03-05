import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { drag } from 'd3-drag';
import { select, Selection } from 'd3-selection';
import { zoom } from 'd3-zoom';
import ELK, { ELK as ElkType, ElkNode } from 'elkjs/lib/elk.bundled';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { DataSet } from 'vis-data/esnext';
import {
  Data,
  Edge,
  Network,
  Node as VisNode,
  Options,
} from 'vis-network/esnext';

import { AppSharedModule } from '~/app-shared.module';
import {
  sankey,
  sankeyCenter,
  SankeyGraph,
  sankeyJustify,
  SankeyLayout,
  sankeyLeft,
  SankeyLinkExtraProperties,
  sankeyLinkHorizontal,
  sankeyLinkLoop,
  SankeyNode,
  sankeyRight,
} from '~/d3-sankey';
import { orString, orZero } from '~/helpers';
import {
  Entities,
  FlowData,
  FlowDiagram,
  Link,
  Node,
  SankeyAlign,
} from '~/models';
import {
  DisplayService,
  FlowService,
  ThemeService,
  ThemeValues,
} from '~/services';
import { LabState, Preferences } from '~/store';
import { PreferencesState } from '~/store/preferences';
import { MainSharedModule } from '../../main-shared.module';

export const SVG_ID = 'lab-flow-svg';
const NODE_WIDTH = 32;
const VIS_NETWORK_OPTIONS: Options = {
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

@UntilDestroy()
@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule, MainSharedModule],
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowComponent implements AfterViewInit {
  ref = inject(ChangeDetectorRef);
  store = inject(Store<LabState>);
  displaySvc = inject(DisplayService);
  flowSvc = inject(FlowService);
  themeSvc = inject(ThemeService);

  @ViewChild('svg') svgElement: ElementRef | undefined;

  height = window.innerHeight * 0.75;
  svg: Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  skLayout: SankeyLayout<SankeyGraph<Node, Link>, Node, Link> | undefined;

  loading$ = new BehaviorSubject(true);
  selectedId$ = new BehaviorSubject<string | null>(null);
  vm$ = combineLatest({ loading: this.loading$, selectedId: this.selectedId$ });

  ngAfterViewInit(): void {
    combineLatest({
      flowData: this.flowSvc.flowData$,
      themeValues: this.themeSvc.themeValues$,
      preferences: this.store.select(Preferences.preferencesState),
    })
      .pipe(untilDestroyed(this))
      .subscribe(({ flowData, themeValues, preferences }) =>
        this.rebuildChart(flowData, themeValues, preferences),
      );
  }

  rebuildChart(
    flowData: FlowData,
    themeValues: ThemeValues,
    preferences: PreferencesState,
  ): void {
    this.loading$.next(true);

    select(`#${SVG_ID} > *`).remove();

    if (flowData.nodes.length && flowData.links.length) {
      if (preferences.flowDiagram === FlowDiagram.Sankey) {
        this.rebuildSankey(flowData, preferences);
      } else {
        this.rebuildBoxLine(flowData, themeValues);
      }
    }

    this.loading$.next(false);
    this.ref.detectChanges();
  }

  rebuildSankey(flowData: FlowData, preferences: PreferencesState): void {
    if (!this.svgElement) return;

    let skGraph = this.getLayout(
      flowData,
      preferences.sankeyAlign,
      800,
      this.height,
    );
    const columns = Math.max(...skGraph.nodes.map((d) => orZero(d.depth)));
    const width = (columns + 1) * NODE_WIDTH + columns * NODE_WIDTH * 8;
    const height = Math.min(this.height, width * 0.75);
    skGraph = this.getLayout(flowData, preferences.sankeyAlign, width, height);

    const svg = select(this.svgElement.nativeElement)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.call(
      zoom<SVGSVGElement, unknown>().on('zoom', (e): void => {
        svg.selectAll('svg > g').attr('transform', e.transform);
      }),
    );

    // Draw linkages (draw first so rects are drawn over them)
    const link = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.6)
      .style('will-change', 'opacity')
      .selectAll('g')
      .data(skGraph.links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    const path = link
      .append('path')
      .attr('id', (l) => `${l.index}`)
      .attr('d', (l) =>
        (l as SankeyLinkExtraProperties).direction === 'forward'
          ? sankeyLinkHorizontal()(l)
          : sankeyLinkLoop(
              orZero(l.width),
              NODE_WIDTH,
              (l.source as SankeyNode<Node, Link>).y1!,
              (l.target as SankeyNode<Node, Link>).y1!,
            )(l),
      )
      .attr('stroke', (l) => l.color)
      .attr('stroke-width', (l) => Math.max(1, orZero(l.width)));

    link.append('title').text((l) => l.name);

    svg
      .append('g')
      .selectAll('text')
      .data(skGraph.links)
      .join('text')
      .append('textPath')
      .attr('startOffset', '4px')
      .attr('href', (l) => `#${l.index}`)
      .text((l) => `${l.text} ${l.name}`);

    // For use inside drag function
    const layout = this.skLayout;

    // Draw rects for nodes
    svg
      .append('g')
      .attr('stroke', 'var(--surface-ground)')
      .selectAll<SVGRectElement, SankeyNode<Node, Link>>('rect')
      .data(skGraph.nodes)
      .join('rect')
      .attr('x', (d) => orZero(d.x0))
      .attr('y', (d) => orZero(d.y0))
      .attr('height', (d) => this.nodeHeight(d))
      .attr('width', (d) => orZero(d.x1) - orZero(d.x0))
      .attr('fill', (d) => d.color)
      .on('click', (e, d) => {
        if (e.defaultPrevented) return;
        this.selectedId$.next(d.stepId);
      })
      .call(
        drag<SVGRectElement, SankeyNode<Node, Link>>()
          .subject((d) => d)
          .on('drag', function (this, event, d) {
            const rectY = parseFloat(select(this).attr('y'));
            const rectX = parseFloat(select(this).attr('x'));
            d.y0 = orZero(d.y0) + event.dy;
            d.y1 = orZero(d.y1) + event.dy;
            d.x0 = orZero(d.x0) + event.dx;
            d.x1 = orZero(d.x1) + event.dx;
            const trX = orZero(d.x0) - rectX;
            const trY = orZero(d.y0) - rectY;
            const transform = 'translate(' + trX + ',' + trY + ')';
            select(this).attr('transform', transform);

            // also move the image
            select(`[id='image-${d.id}']`).attr('transform', transform);
            if (layout) {
              layout.update(skGraph);
            }

            // force an update of the path
            path.attr('d', (l) => {
              if ((l as SankeyLinkExtraProperties).direction === 'forward')
                return sankeyLinkHorizontal()(l);

              const source = l.source as SankeyNode<Node, Link>;
              const target = l.target as SankeyNode<Node, Link>;

              return sankeyLinkLoop(
                orZero(l.width),
                NODE_WIDTH,
                source.y1!,
                target.y1!,
              )(l);
            });
          }),
      )
      .append('title')
      .text((d) => d.name);

    // Draw icons (for rect height >= 16px)
    svg
      .append('g')
      .selectAll('svg')
      .data(skGraph.nodes.filter((d) => this.nodeHeight(d) >= 16))
      .join('g')
      .attr('id', (d) => `image-${d.id}`)
      .append('svg')
      .attr('viewBox', (d) => d.viewBox)
      .attr('width', (d) => Math.min(30, this.nodeHeight(d) - 2))
      .attr('height', (d) => Math.min(30, this.nodeHeight(d) - 2))
      .attr(
        'x',
        (d) =>
          (orZero(d.x1) + orZero(d.x0)) / 2 -
          Math.min(30, this.nodeHeight(d) - 2) / 2,
      )
      .attr(
        'y',
        (d) =>
          (orZero(d.y1) + orZero(d.y0)) / 2 -
          Math.min(30, this.nodeHeight(d) - 2) / 2,
      )
      .style('pointer-events', 'none')
      .append('image')
      .attr('href', (d) => orString(d.href));

    this.svg = svg;
  }

  rebuildBoxLine(flow: FlowData, themeValues: ThemeValues): void {
    const nodes = new DataSet<VisNode>();
    nodes.add(this.getVisNodes(flow, themeValues));

    const edges = new DataSet<Edge>();
    edges.add(this.getVisEdges(flow, themeValues));

    const container = document.getElementById('lab-flow-svg');
    const data: Data = {
      nodes: nodes,
      edges: edges,
    };

    if (container) {
      const network = new Network(container, data, VIS_NETWORK_OPTIONS);
      const graph: ElkNode = {
        id: 'root',
        children: flow.nodes.map((n) => ({
          id: n.id,
          width: 250,
          height: 100,
        })),
        edges: flow.links.map((l) => ({
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
          if (item) nodes.update({ id: node.id, x: item.x, y: item.y });
        });

        network.fit();
        this.loading$.next(false);
      });
    }
  }

  getVisNodes(flow: FlowData, themeValues: ThemeValues): VisNode[] {
    return flow.nodes.map((n) => {
      const el = document.createElement('div');
      el.classList.add('d-flex', 'flex-column', 'align-items-center');
      el.innerHTML += `<div>${n.name}</div>`;
      if (n.recipe) {
        el.innerHTML += `<div class="d-flex align-items-center mt-2">${this.displaySvc.recipeProcess(
          n.recipe,
        )}</div>`;
        if (n.machines != null && n.machineId != null) {
          el.innerHTML += `<div class="d-flex align-items-center mt-2">${this.displaySvc.icon(
            n.machineId,
            n.machines,
          )}</div>`;
        }
      }

      return {
        id: n.id,
        label: `<b>${n.name}</b>\n${n.text}`,
        title: el,
        color: n.id.startsWith('o')
          ? themeValues.successBackground
          : n.id.startsWith('s')
          ? themeValues.dangerBackground
          : n.color,
        shape: n.recipe ? 'box' : 'ellipse',
        font: {
          color: n.id.startsWith('o')
            ? themeValues.successColor
            : n.id.startsWith('s')
            ? themeValues.dangerColor
            : this.foreColor(n.color),
        },
        chosen: { node: this.getVisNodeClickFn(n.stepId), label: false },
      };
    });
  }

  getVisNodeClickFn(id: string): () => void {
    return () => this.selectedId$.next(id);
  }

  getVisEdges(flow: FlowData, themeValues: ThemeValues): Edge[] {
    const duplicateMap: Entities<number> = {};

    return flow.links.map((l) => {
      const id = `${l.source}|${l.target}`;
      duplicateMap[id] = orZero(duplicateMap[id]) + 1;

      return {
        from: l.source,
        to: l.target,
        label: l.text + '\n' + l.name,
        title: l.text + '\n' + l.name,
        smooth: flow.links.some(
          (a) =>
            (a.target === l.source && l.target === a.source) ||
            (a.target === l.target &&
              a.source === l.source &&
              a.name !== l.name),
        )
          ? {
              enabled: true,
              type: 'curvedCW',
              roundness: duplicateMap[id] * 0.3,
            }
          : false,
        selfReference: {
          size: duplicateMap[id] * 50,
        },
        value: l.value,
        font: {
          color: themeValues.textColor,
        },
      };
    });
  }

  getLayout(
    data: FlowData,
    align: SankeyAlign,
    width: number,
    height: number,
  ): SankeyGraph<Node, Link> {
    this.skLayout = sankey<Node, Link>()
      .nodeId((d) => d.id)
      .nodeWidth(NODE_WIDTH)
      .nodeAlign(this.getAlign(align))
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);

    return this.skLayout({
      nodes: data.nodes
        .filter((n) =>
          data.links.some((l) => l.source === n.id || l.target === n.id),
        )
        .map((d) => ({ ...d })),
      links: data.links.map((l) => ({ ...l })),
    });
  }

  /** Mockable helper method for tests */
  getElk(): ElkType {
    return new ELK();
  }

  foreColor(color: string): string {
    const rgb = parseInt(color.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const value = luma <= 125;
    return value ? '#fff' : '#000';
  }

  getAlign(
    align: SankeyAlign | undefined,
  ): (node: SankeyNode<Node, Link>, n: number) => number {
    switch (align) {
      case SankeyAlign.Left:
        return sankeyLeft;
      case SankeyAlign.Right:
        return sankeyRight;
      case SankeyAlign.Center:
        return sankeyCenter;
      default:
        return sankeyJustify;
    }
  }

  nodeHeight(d: SankeyNode<Node, Link>): number {
    return orZero(d.y1) - orZero(d.y0);
  }
}
