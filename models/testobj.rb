require 'mongoid'

class Testobj
  include Mongoid::Document

  field :counter, :type => Integer, :default => 0
end