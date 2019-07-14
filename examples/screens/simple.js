import React from 'react';
import ReactDOM from 'react-dom';

import Layout from '../../src/components/Layout';
import Container from '../../src/components/Container';

import CenterName from '../components/CenterName.tsx';
import ShowDimensions from '../components/ShowDimensions.tsx';

const SimpleExample = () => (
  <Layout type={Layout.COLUMN}>
    <Container>
      <CenterName name="Top" />
    </Container>
    <Container id="parent" initialSize={400}>
      {({ dimensions }) => (
        <Layout type={Layout.ROW}>
          <Container>
            <CenterName name="Bottom Left" />
          </Container>
          <Container id="square" initialSize={dimensions.height}>
            {({ dimensions: dim }) => (
              <ShowDimensions width={dim.width} height={dim.height} />
            )}
          </Container>
        </Layout>
      )}
    </Container>
  </Layout>
);

ReactDOM.render(<SimpleExample />, document.getElementById('root'));
