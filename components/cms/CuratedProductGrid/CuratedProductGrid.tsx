import React, { FC, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useContentAnalytics } from '@lib/analytics';
import { Theme } from '@mui/material';
import { useCmsContext } from '@lib/cms/CmsContext';
import { getProducts } from "@lib/ecommerce/api";
import { LegacySlider, LegacySliderSlide, Section } from '@components/ui';
import CuratedProductGridCard from './CuratedProductGridCard';
import { useUserContext } from '@lib/user/UserContext';
import _ from 'lodash'
import { withStyles, WithStyles } from '@mui/styles'

import { Product, QueryContext } from '@amplience/dc-demostore-integration';
import { useAsync } from '@lib/util';

import { 
  CarouselProvider, 
  Dot,
  Slider as PureSlider, 
  Slide } from 'pure-react-carousel';

import { SliderBackButton, SliderNextButton } from '@components/cms-modern/Slider';

const styles = (theme: Theme) => ({
  root: {
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  item: {
    margin: theme.spacing()
  }
});

interface Props extends WithStyles<typeof styles> {
  className?: string;
  style?: React.CSSProperties;
  header: string;
  products: any[];
  navigationDots?: any;
}

const CuratedProductGrid: FC<Props> = ({
  classes,
  className,
  header,
  products = [],
  navigationDots,
  ...other
}) => {

  // Retrieve locale/country code from context - TODO: get language from user context
  const { locale: cmsLocale } = useCmsContext() || {}
  let locale = cmsLocale || 'en';
  if (locale.indexOf('-') > 0) {
    locale = locale.split('-')[0];
  }

  const {
    trackEvent
  } = useContentAnalytics();

  const [productList, setProductList] = useState<Product[]>([])

  const cmsContext = useCmsContext()
  const userContext = useUserContext()

  useEffect(() => {
    let isMounted: boolean = true
    getProducts(new QueryContext({ args: { productIds: products.join(',') }, ...cmsContext, ...userContext })).then((prods: Product[]) => {
      if (isMounted) {
        // reorder based on the original ordering because these are not ordered
        let orderedProducts: Product[] = []
        _.each(products, product => {
          let ordered: any = _.find(prods, prod => prod.id === product)
          orderedProducts.push(ordered)
        })
        setProductList(orderedProducts)
      }
    })
    return () => { isMounted = false }
  }, [products, cmsContext, userContext])

  if (!productList || productList.length === 0) return (<div></div>)

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <Section title={header}>
        <LegacySlider>
          {
            productList.map((result: any, index: number) => {
              return <LegacySliderSlide key={index} index={index} className={clsx({
                ['amp-length-2']: productList.length < 3,
                ['amp-length-3']: productList.length >= 3
              })}>
                <CuratedProductGridCard data={result} className={classes.item} />
              </LegacySliderSlide>
            })
          }
        </LegacySlider>
      </Section>
    </div>
  );
}

export default withStyles(styles)(CuratedProductGrid);