import React from 'react';
import {Tokens} from './Tokens';
import classNames from 'classnames';
export function TokenImage({tokenName, size = 8, className, ...rest}) {
  return (
    <div
      className={classNames(
        'p-1 flex-shrink-0 rounded-lg bg-card2 inline-flex items-center justify-center',
        `w-${size} h-${size}`,
        className,
      )}
      {...rest}
    >
      <Tokens className="w-full h-full" tokenName={tokenName} />
    </div>
  );
}
