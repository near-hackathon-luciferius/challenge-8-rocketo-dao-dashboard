import React from 'react';
import {streamViewData} from './streamViewData';
import {StreamIn} from './StreamIn';
import {StreamOut} from './StreamOut';
import classNames from 'classnames';

export function StreamingSpeed({stream, direction, className, ...rest}) {
  const {tf} = streamViewData(stream);

  const speedInfo = tf.tokensPerMeaningfulPeriod(stream.tokens_per_sec/Math.pow(10, 9));

  return (
    <div
      className={classNames(
        'inline-flex items-center whitespace-nowrap',
        className,
      )}
      {...rest}
    >
      {direction === 'out' ? (
        <StreamOut />
      ) : direction === 'in' ? (
        <StreamIn />
      ) : (
        ''
      )}
      <span className="ml-2">
        <span>@{speedInfo.formattedValue}</span>
        <span>
          {' '}
          {tf.token_name} / {speedInfo.unit}
        </span>
      </span>
    </div>
  );
}
