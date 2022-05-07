import React from 'react';
import classNames from 'classnames';

import {TokenImage} from './TokenImage';
import {ArcProgressBar} from './ProgressBar';
import {Tooltip} from './Tooltip';
import { streamViewData } from './streamViewData';
import {StreamingSpeed} from './StreamingSpeed';
import {streamDirection} from './lib';
import {StreamProgressPercentage} from './StreamProgressPercentage';

export function StreamDashboard({stream, account}) {
  const {
    tf,
    progresses,
    percentages,
    isDead,
    progress: {full, withdrawn, streamed},
  } = streamViewData(stream);
  const direction = streamDirection({stream, account});

  return (
    <div
      className={classNames(
        'flex',
        'flex-col',
        'items-center',
      )}
    >
      <div className="-mb-32">
        <Tooltip
          align={{offset: [0, -20]}}
          offset={{top: 20}}
          overlay={
            <div className="text-left">
              <StreamProgressPercentage
                className="whitespace-nowrap mb-2"
                label="Withdrawn"
                colorClass="bg-streams-withdrawn"
                formattedFloatValue={
                  tf.amount(withdrawn) + ' ' + tf.token_name
                }
                percentageValue={percentages.withdrawn}
              />
              <StreamProgressPercentage
                className="whitespace-nowrap"
                label="Streamed"
                colorClass="bg-streams-streamed"
                formattedFloatValue={
                  tf.amount(streamed) + ' ' + tf.token_name
                }
                percentageValue={percentages.streamed}
              />
            </div>
          }
        >
          <ArcProgressBar
            className="w-96 h-48"
            progresses={progresses}
          />
        </Tooltip>

        <div className="flex justify-between pt-5 -mx-2 text-gray">
          <div className="w-10 text-center"> 0%</div>
          <div className="w-10 text-center"> 100%</div>
        </div>
      </div>

      <TokenImage
        size={14}
        tokenName={tf.token_name}
        className="mb-8"
      />
      <div className="text-6xl font-semibold">
        {tf.amount(streamed)}
      </div>
      <div className="text-gray font-semibold">
        of {tf.amount(full)} {tf.token_name}
      </div>
      <StreamingSpeed
        stream={stream}
        direction={direction}
        className="mt-6 mb-6"
      />
    </div>
  );
}
