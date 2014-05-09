require 'mongoid'

class Badge
  include Mongoid::Document

  field :description, :type => String
  field :label, :type => String
  field :avatar, :type => String
end