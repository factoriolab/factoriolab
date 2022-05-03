import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { drag } from 'd3-drag';
import {
  sankey,
  sankeyCenter,
  SankeyGraph,
  sankeyJustify,
  SankeyLayout,
  sankeyLeft,
  sankeyLinkHorizontal,
  SankeyNode,
  SankeyNodeMinimal,
  sankeyRight,
} from 'd3-sankey';
import { sankeyCircular } from 'd3-sankey-circular';
import { select, Selection } from 'd3-selection';
import { combineLatest, map } from 'rxjs';

import {
  Link,
  LinkValue,
  linkValueOptions,
  ListMode,
  Node,
  SankeyAlign,
  sankeyAlignOptions,
  SankeyData,
} from '~/models';
import { LabState } from '~/store';
import * as Preferences from '~/store/preferences';
import * as Products from '~/store/products';
import * as Settings from '~/store/settings';
import { ExportUtility } from '~/utilities';

@UntilDestroy()
@Component({
  selector: 'lab-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowComponent implements AfterViewInit {
  vm$ = combineLatest([
    this.store.select(Products.getSankey),
    this.store.select(Settings.getGame),
    this.store.select(Preferences.getLinkText),
    this.store.select(Preferences.getLinkSize),
    this.store.select(Preferences.getSankeyAlign),
  ]).pipe(
    map(([sankey, game, linkText, linkSize, sankeyAlign]) => ({
      sankey,
      linkText,
      linkSize,
      sankeyAlign,
      options: linkValueOptions(game),
    }))
  );

  @ViewChild('svg') svgElement: ElementRef | undefined;

  selectedId: string | undefined;
  height = window.innerHeight * 0.75;
  svg: Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  skLayout: SankeyLayout<SankeyGraph<Node, Link>, Node, Link> | undefined;

  sankeyAlignOptions = sankeyAlignOptions;
  ListMode = ListMode;

  constructor(private ref: ChangeDetectorRef, private store: Store<LabState>) {}

  ngAfterViewInit(): void {
    combineLatest([
      this.store.select(Products.getSankey),
      this.store.select(Preferences.getSankeyAlign),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([data, align]) => this.rebuildChart(data, align));
  }

  rebuildChart(data: SankeyData, align: SankeyAlign): void {
    if (this.svg) {
      select('svg').remove();
    }

    if (data.nodes.length && data.links.length) {
      this.createChart(data, align);
    }
  }

  createChart(data: SankeyData, align: SankeyAlign): void {
    if (this.svgElement) {
      let circular = true;
      let skGraph = this.getLayout(data, align, true, 800, this.height);

      if (!skGraph.nodes.some((n: any) => n.partOfCycle === true)) {
        // No circular references, use built in sankey generator
        circular = false;
        skGraph = this.getLayout(data, align, circular, 800, this.height);
      }

      const columns = Math.max(
        ...skGraph.nodes.map((d) => this.orZero(d.depth))
      );
      const width = (columns + 1) * 32 + columns * 32 * 12;
      const height = Math.min(this.height, width * 0.75);
      skGraph = this.getLayout(data, align, circular, width, height);

      this.svg = select(this.svgElement.nativeElement)
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('width', `${width}px`)
        .attr('height', `${height}px`)
        .style('width', `${width}px`)
        .style('height', `${height}px`)
        .attr('viewBox', `0 0 ${width} ${height}`);

      // Draw linkages (draw first so rects are drawn over them)
      const link = this.svg
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
        .attr(
          'd',
          circular ? (d): string => (d as any).path : sankeyLinkHorizontal()
        )
        .attr('stroke', (l) => l.color)
        .attr('stroke-width', (l) => Math.max(1, this.orZero(l.width)));

      link.append('title').text((l) => l.name);

      const layout = this.skLayout;
      const orZero = this.orZero;
      function dragMove(
        this: SVGElement,
        event: any,
        d: SankeyNode<Node, Link>
      ): void {
        const rectY = parseFloat(select(this).attr('y'));
        const rectX = parseFloat(select(this).attr('x'));
        d.y0 = d.y0 + event.dy;
        d.x0 = d.x0 + event.dx;
        d.x1 = d.x1 + event.dx;
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
        path.attr(
          'd',
          circular ? (d): string => (d as any).path : sankeyLinkHorizontal()
        );
      }

      this.svg
        .append('g')
        .selectAll('text')
        .data(skGraph.links)
        .join('text')
        .append('textPath')
        .attr('startOffset', '4px')
        .attr('href', (l) => `#${l.index}`)
        .text((l) => `${l.text} ${l.name}`);

      // Draw rects for nodes
      this.svg
        .append('g')
        .attr('stroke', 'var(--color-black)')
        .selectAll<SVGRectElement, SankeyNode<Node, Link>>('rect')
        .data(skGraph.nodes)
        .join('rect')
        .attr('x', (d) => this.orZero(d.x0))
        .attr('y', (d) => this.orZero(d.y0))
        .attr('height', (d) => this.rngY(d))
        .attr('width', (d) => this.orZero(d.x1) - this.orZero(d.x0))
        .attr('fill', (d) => d.color)
        .on('click', (e, d) => {
          if (e.defaultPrevented) return;
          this.setSelected(d.stepId);
        })
        .call(
          drag<SVGRectElement, SankeyNode<Node, Link>>()
            .subject((d) => d)
            .on('drag', dragMove)
        )
        .append('title')
        .text((d) => d.name);

      // Draw icons (for rect height >= 16px)
      this.svg
        .append('g')
        .selectAll('svg')
        .data(skGraph.nodes.filter((d) => this.rngY(d) >= 16))
        .join('g')
        .attr('id', (d) => `image-${d.id}`)
        .append('svg')
        .attr('viewBox', (d) => d.viewBox)
        .attr('width', (d) => Math.min(30, this.rngY(d) - 2))
        .attr('height', (d) => Math.min(30, this.rngY(d) - 2))
        .attr(
          'x',
          (d) =>
            (this.orZero(d.x1) + this.orZero(d.x0)) / 2 -
            Math.min(30, this.rngY(d) - 2) / 2
        )
        .attr(
          'y',
          (d) =>
            (this.orZero(d.y1) + this.orZero(d.y0)) / 2 -
            Math.min(30, this.rngY(d) - 2) / 2
        )
        .style('pointer-events', 'none')
        .append('image')
        .attr('href', (d) => d.href ?? '');
    }
  }

  getLayout(
    data: SankeyData,
    align: SankeyAlign,
    circular: boolean,
    width: number,
    height: number
  ): SankeyGraph<Node, Link> {
    const fn: () => SankeyLayout<SankeyGraph<Node, Link>, Node, Link> = circular
      ? sankeyCircular
      : sankey;
    this.skLayout = fn()
      .nodeId((d) => d.id)
      .nodeWidth(32)
      .nodePadding(8)
      .nodeAlign(this.getAlign(align))
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);

    return this.skLayout({
      nodes: data.nodes
        .filter((n) =>
          data.links.some((l) => l.source === n.id || l.target === n.id)
        )
        .map((d) => ({ ...d })),
      links: data.links.map((l) => ({ ...l })),
    });
  }

  getAlign(
    align: SankeyAlign | undefined
  ): (node: SankeyNodeMinimal<{}, {}>, n: number) => number {
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

  orZero(n?: number): number {
    return n ?? 0;
  }

  rngY(d: SankeyNode<Node, Link>): number {
    return this.orZero(d.y1) - this.orZero(d.y0);
  }

  setSelected(id: string): void {
    this.selectedId = id;
    this.ref.detectChanges();
  }

  export(data: SankeyData): void {
    ExportUtility.saveAsJson(JSON.stringify(data));
  }

  /** Action Dispatch Methods */
  setLinkSize(value: LinkValue): void {
    this.store.dispatch(new Preferences.SetLinkSizeAction(value));
  }

  setLinkText(value: LinkValue): void {
    this.store.dispatch(new Preferences.SetLinkTextAction(value));
  }

  setSankeyAlign(value: SankeyAlign): void {
    this.store.dispatch(new Preferences.SetSankeyAlignAction(value));
  }
}
