import { Dialog } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { faFileArrowDown, faGear } from '@fortawesome/free-solid-svg-icons';
import { drag, select, Selection, zoom } from 'd3';
import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs';
import { combineLatest, debounceTime, switchMap } from 'rxjs';

import { Button } from '~/components/button/button';
import { FlowSettingsDialog } from '~/components/flow-settings-dialog/flow-settings-dialog';
import { Steps } from '~/components/steps/steps';
import { boxEdgeLine } from '~/d3/box-line/box-line-edge';
import { BoxEdge, BoxNode } from '~/d3/box-line/models';
import {
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
} from '~/d3/sankey/align';
import {
  SankeyGraph,
  SankeyGraphMinimal,
  SankeyLayout,
  SankeyLinkExtraProperties,
  SankeyNode,
} from '~/d3/sankey/models';
import { sankey } from '~/d3/sankey/sankey';
import {
  sankeyLinkHorizontal,
  sankeyLinkLoop,
} from '~/d3/sankey/sankey-link-horizontal';
import { Exporter } from '~/exporter/exporter';
import { FlowBuilder } from '~/flow/flow-builder';
import { FlowData } from '~/flow/flow-data';
import { Link } from '~/flow/link';
import { Node } from '~/flow/node';
import { FlowDiagram } from '~/state/preferences/flow-diagram';
import { FlowSettings } from '~/state/preferences/flow-settings';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { SankeyAlign } from '~/state/preferences/sankey-align';
import { coalesce } from '~/utils/nullish';
import { spread } from '~/utils/object';

export const SVG_ID = 'lab-flow-svg';
const NODE_WIDTH = 32;

interface ElkGraph extends ElkNode {
  children: BoxNode[];
  edges: (Link & ElkExtendedEdge)[];
}

@Component({
  selector: 'lab-flow',
  imports: [Button, Steps],
  templateUrl: './flow.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1 sm:gap-2 pb-3 lg:pb-6' },
})
export class Flow implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ref = inject(ChangeDetectorRef);
  protected readonly dialog = inject(Dialog);
  protected readonly exporter = inject(Exporter);
  protected readonly flowBuilder = inject(FlowBuilder);
  private readonly preferencesStore = inject(PreferencesStore);

  svgElement = viewChild.required<ElementRef<HTMLElement>>('svg');

  height = window.innerHeight * 0.75;
  svg: Selection<SVGSVGElement, unknown, null, undefined> | undefined;

  selectedId = signal<string | undefined>(undefined);
  data$ = combineLatest({
    data: toObservable(this.flowBuilder.flowData),
    settings: toObservable(this.preferencesStore.flowSettings),
  });

  private readonly elk = new ELK();
  protected readonly faFileArrowDown = faFileArrowDown;
  protected readonly faGear = faGear;
  protected readonly FlowSettingsDialog = FlowSettingsDialog;

  ngAfterViewInit(): void {
    this.data$
      .pipe(
        debounceTime(0),
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ data, settings }) => this.rebuildChart(data, settings)),
      )
      .subscribe();
  }

  async rebuildChart(
    flowData: FlowData,
    flowSettings: FlowSettings,
  ): Promise<void> {
    select(`#${SVG_ID} > *`).remove();

    if (flowData.nodes.length && flowData.links.length) {
      if (flowSettings.diagram === FlowDiagram.Sankey)
        this.rebuildSankey(flowData, flowSettings);
      else await this.rebuildBoxLine(flowData, flowSettings);
    }
  }

  rebuildSankey(flowData: FlowData, flowSettings: FlowSettings): void {
    let layout = this.getLayout(flowSettings.sankeyAlign, 800, this.height);
    let skGraph = this.getGraph(layout, flowData);
    const columns = Math.max(...skGraph.nodes.map((d) => coalesce(d.depth, 0)));
    const width = (columns + 1) * NODE_WIDTH + columns * NODE_WIDTH * 8;
    const height = Math.min(this.height, width * 0.75);
    layout = this.getLayout(flowSettings.sankeyAlign, width, height);
    skGraph = this.getGraph(layout, flowData);

    const svg = select(this.svgElement().nativeElement)
      .append('svg')
      .attr('viewBox', `0 0 ${width.toString()} ${height.toString()}`)
      .attr('class', 'min-h-[75dvh]');

    svg.call(
      zoom<SVGSVGElement, unknown>().on(
        'zoom',
        (e: { transform: string }): void => {
          svg.selectAll('svg > g').attr('transform', e.transform);
        },
      ),
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
      .attr('id', (l) => l.index)
      .attr('d', (l) =>
        (l as SankeyLinkExtraProperties).direction === 'forward'
          ? sankeyLinkHorizontal()(l)
          : sankeyLinkLoop(
              coalesce(l.width, 0),
              NODE_WIDTH,
              (l.source as SankeyNode<Node, Link>).y1,
              (l.target as SankeyNode<Node, Link>).y1,
            )(l),
      )
      .attr('stroke', (l) => l.color)
      .attr('stroke-width', (l) => Math.max(1, coalesce(l.width, 0)));

    link.append('title').text((l) => l.name);

    svg
      .append('g')
      .selectAll('text')
      .data(skGraph.links)
      .join('text')
      .attr('class', 'fill-gray-50 translate-y-2')
      .append('textPath')
      .attr('startOffset', '4px')
      .attr('href', (l) => `#${l.index.toString()}`)
      .attr('class', 'pointer-events-none')
      .text((l) => `${l.text} ${l.name}`);

    // Draw rects for nodes
    svg
      .append('g')
      .attr('stroke', 'var(--color-gray-700)')
      .selectAll<SVGRectElement, SankeyNode<Node, Link>>('rect')
      .data(skGraph.nodes)
      .join('rect')
      .attr('class', 'cursor-pointer hover:stroke-brand-500')
      .attr('x', (d) => coalesce(d.x0, 0))
      .attr('y', (d) => coalesce(d.y0, 0))
      .attr('height', (d) => this.nodeHeight(d))
      .attr('width', (d) => coalesce(d.x1, 0) - coalesce(d.x0, 0))
      .attr('fill', (d) => d.color)
      .on('click', (e: Event, d) => {
        if (e.defaultPrevented) return;
        this.selectedId.set(d.stepId);
      })
      .call(
        drag<SVGRectElement, SankeyNode<Node, Link>>()
          .subject((d) => d as SankeyNode<Node, Link>)
          .on('drag', function (this, event: { dy: number; dx: number }, d) {
            const rectY = parseFloat(select(this).attr('y'));
            const rectX = parseFloat(select(this).attr('x'));
            d.y0 = coalesce(d.y0, 0) + event.dy;
            d.y1 = coalesce(d.y1, 0) + event.dy;
            d.x0 = coalesce(d.x0, 0) + event.dx;
            d.x1 = coalesce(d.x1, 0) + event.dx;
            const trX = coalesce(d.x0, 0) - rectX;
            const trY = coalesce(d.y0, 0) - rectY;
            const transform = `translate(${trX.toString()},${trY.toString()})`;
            select(this).attr('transform', transform);

            // also move the image
            select(`[id='image-${d.id}']`).attr('transform', transform);
            layout.update(skGraph);

            // force an update of the path
            path.attr('d', (l) => {
              if ((l as SankeyLinkExtraProperties).direction === 'forward')
                return sankeyLinkHorizontal()(l);

              const source = l.source as SankeyNode<Node, Link>;
              const target = l.target as SankeyNode<Node, Link>;

              return sankeyLinkLoop(
                coalesce(l.width, 0),
                NODE_WIDTH,
                source.y1,
                target.y1,
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
          (coalesce(d.x1, 0) + coalesce(d.x0, 0)) / 2 -
          Math.min(30, this.nodeHeight(d) - 2) / 2,
      )
      .attr(
        'y',
        (d) =>
          (coalesce(d.y1, 0) + coalesce(d.y0, 0)) / 2 -
          Math.min(30, this.nodeHeight(d) - 2) / 2,
      )
      .attr('class', 'pointer-events-none')
      .append('image')
      .attr('href', (d) => coalesce(d.href, ''));

    this.svg = svg;
  }

  async rebuildBoxLine(
    flow: FlowData,
    flowSettings: FlowSettings,
  ): Promise<void> {
    const graph: ElkGraph = {
      id: 'root',
      layoutOptions: { 'elk.algorithm': flowSettings.elkAlgorithm },
      children: flow.nodes.map((n) => ({ ...n, ...{ width: 38, height: 38 } })),
      edges: flow.links.map((n) => ({
        ...n,
        ...{
          id: n.source + '|' + n.target,
          sources: [n.source],
          targets: [n.target],
        },
      })),
    };
    const result = await this.elk.layout(graph);

    if (
      result.children == null ||
      result.edges == null ||
      result.width == null ||
      result.height == null
    )
      return;

    const boxes = result.children;
    const edges = flow.links.map(
      (l): BoxEdge =>
        spread<BoxEdge>(l as unknown as BoxEdge, {
          id: `${l.source}|${l.target}`,
          sourceNode: boxes.find((b) => b.id === l.source),
          targetNode: boxes.find((b) => b.id === l.target),
        }),
    );

    const svg = select(this.svgElement().nativeElement)
      .append('svg')
      .attr(
        'viewBox',
        `0 0 ${result.width.toString()} ${result.height.toString()}`,
      )
      .attr('class', 'min-h-[75dvh]');

    svg.call(
      zoom<SVGSVGElement, unknown>().on(
        'zoom',
        (e: { transform: string }): void => {
          svg.selectAll('svg > g').attr('transform', e.transform);
        },
      ),
    );

    const edge = svg
      .append('g')
      .attr('fill', 'none')
      .selectAll('g')
      .data(edges)
      .join('g')
      .attr('class', 'mix-blend-multiply');

    svg
      .append('defs')
      .selectAll('marker')
      .data(edges)
      .join('marker')
      .attr('id', (e) => `arrow-${e.id}`)
      .attr('viewBox', [0, 0, 640, 640])
      .attr('refX', 320)
      .attr('refY', 320)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr(
        'd',
        'M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z',
      )
      .attr('fill', (e) => e.color);

    const path = edge
      .append('path')
      .attr('d', (e) => boxEdgeLine(5)(e))
      .attr('stroke', (e) => e.color)
      .attr('stroke-width', 2)
      .attr('marker-end', (e) => `url(#arrow-${e.id})`);
    const textPath = edge
      .append('path')
      .attr('id', (e) => e.id)
      .attr('d', (e) => boxEdgeLine(0, true)(e));

    edge.append('title').text((e) => e.name);

    svg
      .append('g')
      .selectAll('text')
      .data(edges)
      .join('text')
      .attr('dy', '-2px')
      .attr(
        'class',
        'fill-gray-50 text-[6px] text-shadow-sm text-shadow-gray-950',
      )
      .append('textPath')
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .attr('href', (e) => `#${e.id}`)
      .attr('class', 'pointer-events-none')
      .text((l) => l.text);

    // Main node svg
    const node = svg
      .append('g')
      .selectAll<SVGSVGElement, unknown>('svg')
      .data(result.children)
      .join('svg')
      .attr('class', 'overflow-visible')
      .attr('x', (d) => coalesce(d.x, 0))
      .attr('y', (d) => coalesce(d.y, 0))
      .on('click', (e: Event, d) => {
        if (e.defaultPrevented) return;
        this.selectedId.set(d.stepId);
      })
      .call(
        drag<SVGSVGElement, Node & ElkNode>()
          .subject((d) => d as Node & ElkNode)
          .on('drag', function (this, event: { dy: number; dx: number }, d) {
            d.y = coalesce(d.y, 0) + event.dy;
            d.x = coalesce(d.x, 0) + event.dx;
            select(this).attr('x', d.x).attr('y', d.y);
            path.attr('d', (e) => boxEdgeLine(5)(e));
            textPath.attr('d', (e) => boxEdgeLine(0, true)(e));
          }),
      );

    // Node rect
    node
      .append('rect')
      .attr('class', 'cursor-pointer hover:stroke-brand-500 stroke-gray-700')
      .attr('x', 1)
      .attr('y', 1)
      .attr('ry', 2)
      .attr('rx', 2)
      .attr('height', 36)
      .attr('width', 36)
      .attr('fill', (d) => d.color)
      .append('title')
      .text((d) => d.name);

    // Node image
    node
      .append('svg')
      .attr('viewBox', (d) => d.viewBox)
      .attr('width', 32)
      .attr('height', 32)
      .attr('x', 2)
      .attr('y', 2)
      .append('image')
      .attr('href', (d) => d.href)
      .attr('class', 'pointer-events-none');

    // Filter nodes with subBox
    const subNode = node.filter((d) => d.subBox != null);

    // Add subBox rect
    subNode
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('ry', 10)
      .attr('rx', 10)
      .attr('x', 8)
      .attr('y', 8)
      .attr('class', 'pointer-events-none fill-black blur-[2.5px]');

    // Add subBox image
    subNode
      .append('svg')
      .attr('viewBox', (d) => d.subBox ?? '')
      .attr('width', 16)
      .attr('height', 16)
      .attr('x', 10)
      .attr('y', 10)
      .append('image')
      .attr('href', (d) => d.href)
      .attr('class', 'pointer-events-none');

    // Node text
    node
      .append('text')
      .attr(
        'class',
        'fill-gray-50 text-[6px] text-shadow-sm text-shadow-black pointer-events-none',
      )
      .style('text-anchor', 'middle')
      .attr('y', 35)
      .attr('x', 18)
      .text((d) => d.text);

    this.svg = svg;
  }

  private getLayout(
    align: SankeyAlign,
    width: number,
    height: number,
  ): SankeyLayout<SankeyGraphMinimal<Node, Link>, Node, Link> {
    return sankey<Node, Link>()
      .nodeId((d) => d.id)
      .nodeWidth(NODE_WIDTH)
      .nodeAlign(this.getAlign(align))
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);
  }

  private getGraph(
    layout: SankeyLayout<SankeyGraphMinimal<Node, Link>, Node, Link>,
    data: FlowData,
  ): SankeyGraph<Node, Link> {
    return layout({
      nodes: data.nodes
        .filter((n) =>
          data.links.some((l) => l.source === n.id || l.target === n.id),
        )
        .map((d) => spread(d)),
      links: data.links.map((l) => spread(l)),
    });
  }

  private getAlign(
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

  private nodeHeight(d: SankeyNode<Node, Link>): number {
    return coalesce(d.y1, 0) - coalesce(d.y0, 0);
  }
}
